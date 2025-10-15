# SmartOLT: Implementation Plan for Advanced Features

## 1. Introduction

This document outlines the strategic plan to evolve the SmartOLT application from its current state as a robust network monitoring and data aggregation tool into a comprehensive, intelligent network automation and management platform.

The primary goal is to implement features that enable zero-touch provisioning, proactive fault detection, and network planning, thereby significantly reducing manual effort and improving network reliability.

## 2. Current State Analysis

The following table summarizes the status of the requested features against the current implementation.

| Requirement | Status | Analysis |
| :--- | :--- | :--- |
| **1. OLT Configuration** | ❌ **Not Implemented** | The system can read and model OLT data but lacks the logic to *write* configurations back to devices. |
| **2. ONU Provisioning** | 🌗 **Partially Implemented** | Models for ONUs and Speed Profiles exist, but the core logic to translate a service request into low-level OLT commands is missing. |
| **3. Proactive Monitoring** | 🌗 **Partially Implemented** | Excellent data collection is in place. The missing piece is the proactive analysis of this data (e.g., detecting signal degradation over time). |
| **4. Optical Budget Calculator** | ❌ **Not Implemented** | This is a new utility feature for network planning that does not yet exist. |
| **5. Proactive Fault Detection** | ❌ **Not Implemented** | The system logs outages but does not yet analyze trends to predict and flag potential issues *before* they cause a full outage. |

---

## 3. Phased Implementation Strategy

To ensure a structured and manageable development process, the implementation will be divided into three logical phases:

*   **Phase 0: Multi-Vendor Discovery Refactoring (Preliminary Phase)**
    *   **Focus**: Refactoring the existing read-only discovery and monitoring tasks to support multiple OLT vendors. This establishes the core driver architecture.
    *   **Requirements Covered**: Foundational work for all requirements.

*   **Phase 1: Core Automation (Provisioning & Configuration)**
    *   **Focus**: Extending the driver architecture with write capabilities to implement the most critical automation features.
    *   **Requirements Covered**: #1 (OLT Configuration) & #2 (ONU Provisioning).

*   **Phase 2: Proactive Intelligence (Monitoring & Alerting)**
    *   **Focus**: Building an intelligence layer on top of the existing monitoring data to enable proactive network maintenance.
    *   **Requirements Covered**: #3 (Proactive Monitoring) & #5 (Proactive Fault Detection).

*   **Phase 3: Network Planning Tools**
    *   **Focus**: Adding high-value utility features that assist engineers in designing and planning network expansions.
    *   **Requirements Covered**: #4 (Optical Budget Calculator).

---

## 4. Detailed Phase Plans

### Phase 0: Multi-Vendor Discovery Refactoring (Preliminary Phase)

**Objective**: Abstract all vendor-specific discovery logic into a unified driver architecture, making the current read-only features fully multi-vendor capable.

#### **Step 1: Establish the Vendor-Agnostic Driver Architecture**

1.  **Create a `drivers` Directory**:
    *   Inside the `network` app, create a new directory: `network/olt_drivers/`.

2.  **Define a Base Driver Interface**:
    *   Create `network/olt_drivers/base.py`.
    *   Define a `BaseOLTDriver` class with abstract methods for common **read-only** actions:
        *   `connect()`
        *   `disconnect()`
        *   `get_system_metrics()`
        *   `get_installed_boards()`
        *   `get_pon_port_details(slot_num, num_ports)`
        *   `get_ont_details_for_pon_port(slot_num, port_num, num_onts)`
        *   `discover_unconfigured_onts()`

3.  **Implement Vendor-Specific Discovery Drivers**:
    *   Create driver files for each supported vendor (e.g., `network/olt_drivers/zte.py`, `network/olt_drivers/huawei.py`).
    *   Each driver class (e.g., `ZTEOLTDriver`) will inherit from `BaseOLTDriver` and implement the abstract methods using the specific Telnet, SSH, or SNMP commands for that vendor.

#### **Step 2: Refactor Existing Discovery Tasks**

1.  **Create a Driver Factory**:
    *   In a new utility file (e.g., `network/olt_drivers/factory.py`), create a function `get_driver_for_olt(olt_model)` that returns the correct driver instance based on the OLT's vendor or model string.

2.  **Update Celery Tasks to Use Drivers**:
    *   Modify the existing discovery tasks in `network/tasks.py`:
        *   `discover_and_create_cards_task`: Instead of calling `get_installed_board_info` directly, it will now get the appropriate driver for the OLT and call `driver.get_installed_boards()`.
        *   `discover_and_create_pon_ports_task`: Will use `driver.get_pon_port_details()`.
        *   `discover_and_update_onts_for_pon_port_task`: Will use `driver.get_ont_details_for_pon_port()`.
        *   `update_olt_system_metrics_task`: Will use `driver.get_system_metrics()`.
        *   `discover_unconfigured_onts_task`: Will use `driver.discover_unconfigured_onts()`.

3.  **Deprecate Old Utilities**:
    *   Once the tasks are refactored, the old, direct-use utility functions (e.g., `get_installed_board_info`) can be marked for deprecation or made private to their respective driver modules.

---

### Phase 1: Core Automation (Provisioning & Configuration)

**Objective**: Extend the driver architecture with write capabilities to enable automated ONU provisioning and OLT configuration.

#### **Step 1: Extend the Driver Architecture with Write Methods**

1.  **Update `BaseOLTDriver`**:
    *   Add new abstract methods for write operations to `network/olt_drivers/base.py`:
        *   `provision_onu(onu_model, speed_profile_model)`
        *   `deprovision_onu(onu_model)`
        *   `create_vlan(vlan_id, description)`

2.  **Implement Write Methods in Vendor Drivers**:
    *   In each vendor-specific driver (`zte.py`, etc.), implement the new write methods using the required Telnet/SSH commands.

#### **Step 2: Create Asynchronous Provisioning Tasks**

1.  **Create a Driver Factory**:
    *   In `network/tasks.py` or a new utility file, create a function `get_driver_for_olt(olt_model)` that returns the correct driver instance based on the OLT's vendor or model string.

2.  **Develop Celery Tasks**:
    *   In `network/tasks.py`, create asynchronous tasks for long-running network operations:
        *   `provision_onu_task(onu_id, speed_profile_id)`: Fetches the models, gets the correct driver, and calls `driver.provision_onu()`. Updates the ONU status in the database upon success or failure.
        *   `deprovision_onu_task(onu_id)`: Similar to the above, but for deactivation.

#### **Step 3: Expose Functionality via API Endpoints**

1.  **Update `ONUViewSet`**:
    *   In `network/views.py`, add a custom `@action` to the `ONUViewSet` named `provision`.
    *   This action will accept a `POST` request with a `speed_profile_id`.
    *   It will validate the input and queue the `provision_onu_task.delay()`.
    *   It will return an `HTTP 202 Accepted` response, indicating the task has been queued.

2.  **Integrate with `UnconfiguredONT` Workflow**:
    *   The `authorize_ont` view should be modified. Instead of just creating an `ONU` record, it should also trigger the `provision_onu_task` as part of the authorization process, making it a true zero-touch step.

---

### Phase 2: Proactive Intelligence (Monitoring & Alerting)

**Objective**: Automatically detect and alert on network degradation trends, such as gradual signal loss, to prevent future outages.

#### **Step 1: Model and Collect Granular Signal History**

1.  **Create `ONUSignalHistory` Model**:
    *   In `network/models.py`, create a new model `ONUSignalHistory`.
    *   **Fields**: `onu` (ForeignKey), `timestamp`, `rx_power_at_olt`, `rx_power_at_ont`.
    *   This model will store a time-series record of signal levels for each ONU.

2.  **Update Data Collection Task**:
    *   Modify the `discover_and_update_onts_for_pon_port_task` in `network/tasks.py`.
    *   After updating an `ONU` object with the latest signal data, create a new `ONUSignalHistory` record with that same data. This should be done for every online ONU during each refresh cycle.

#### **Step 2: Develop an Analysis and Alerting Task**

1.  **Create `analyze_signal_degradation_task`**:
    *   In `network/tasks.py`, create a new periodic Celery task.
    *   This task will run at a configurable interval (e.g., every 30 minutes).
    *   **Logic**:
        1.  Iterate through all `online` ONUs.
        2.  For each ONU, retrieve the last two `ONUSignalHistory` records.
        3.  Calculate the delta between the `rx_power_at_olt` values.
        4.  If the signal drop exceeds a defined threshold (e.g., `3.0` dB), an alert is triggered.

2.  **Implement Alerting Mechanism**:
    *   Create a new `Alert` model to log these events in the database.
    *   Integrate an alerting service (e.g., Django's email backend, a third-party service like PagerDuty via webhooks) to send notifications when an alert is generated.

---

### Phase 3: Network Planning Tools

**Objective**: Provide a utility to help network engineers design reliable PON networks by calculating optical power budgets.

#### **Step 1: Create a Stateless API Endpoint**

1.  **Develop `OpticalBudgetCalculatorView`**:
    *   In `network/views.py`, create a new `APIView`. This view will not be tied to a model.
    *   It will accept a `POST` request containing the parameters for the calculation.

2.  **Define Input Parameters**:
    *   `olt_tx_power` (dBm)
    *   `onu_sensitivity` (dBm)
    *   `link_distance_km` (km)
    *   `splitter_ratios` (e.g., `[8]` for 1:8, or `[4, 8]` for cascaded 1:4 -> 1:8)
    *   `splice_count`
    *   `connector_count`

#### **Step 2: Implement Calculation Logic**

1.  **Define Loss Constants**:
    *   Inside the view's `post` method, define constants for typical loss values (fiber loss per km, splice loss, connector loss, and a map of splitter ratios to their corresponding loss values).

2.  **Calculate and Return Results**:
    *   Sum all the losses to get a `total_link_loss`.
    *   Calculate `estimated_power_at_onu` = `olt_tx_power` - `total_link_loss`.
    *   Calculate `power_margin` = `estimated_power_at_onu` - `onu_sensitivity`.
    *   Return a JSON response containing the inputs, calculated values, and a `is_viable` boolean (e.g., `True` if `power_margin` > 3.0 dB).

#### **Step 3: Add URL Configuration**

1.  **Update `urls.py`**:
    *   In `network/urls.py`, add a new path for the calculator view (e.g., `path('tools/optical-budget-calculator/', OpticalBudgetCalculatorView.as_view(), name='optical-budget-calculator')`).
