import paramiko
import re
import json
import time
import asyncio
from pysnmp.hlapi.asyncio import *

# Standard MIB OIDs
SYSTEM_UPTIME_OID="1.3.6.1.2.1.1.3.0"

# ENTITY-MIB OIDs for board/card discovery
OID_ENT_PHYSICAL_TABLE = '1.3.6.1.2.1.47.1.1.1'
OID_ENT_PHYSICAL_INDEX = OID_ENT_PHYSICAL_TABLE + '.1.1' # entPhysicalIndex
OID_ENT_PHYSICAL_DESCR = OID_ENT_PHYSICAL_TABLE + '.1.2' # entPhysicalDescr
OID_ENT_PHYSICAL_CLASS = OID_ENT_PHYSICAL_TABLE + '.1.5' # entPhysicalClass, 9 for module/card
OID_ENT_PHYSICAL_PARENT_REL_POS = OID_ENT_PHYSICAL_TABLE + '.1.6' # entPhysicalParentRelPos (slot number)
OID_ENT_PHYSICAL_NAME = OID_ENT_PHYSICAL_TABLE + '.1.7' # entPhysicalName
OID_ENT_PHYSICAL_MODEL_NAME = OID_ENT_PHYSICAL_TABLE + '.1.13' # entPhysicalModelName (board type/name)
OID_ENT_PHYSICAL_OPER_STATUS = OID_ENT_PHYSICAL_TABLE + '.1.16' # entPhysicalOperStatus (1=up, 2=down, 3=testing)

# IF-MIB OIDs for port discovery
OID_IF_TABLE = '1.3.6.1.2.1.2.2'
OID_IF_INDEX = OID_IF_TABLE + '.1.1'  # ifIndex
OID_IF_DESCR = OID_IF_TABLE + '.1.2'  # ifDescr (interface description/name)
OID_IF_TYPE = OID_IF_TABLE + '.1.3'   # ifType (e.g., ethernetCsmacd(6), gigabitEthernet(117), pon(210))
OID_IF_OPER_STATUS = OID_IF_TABLE + '.1.8' # ifOperStatus (1=up, 2=down, 3=testing)

# Huawei Specific OIDs (add others from your list as needed for other functions)
HUAWEI_OLT_TEMPERATURE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.23.1.1' # Matches SYSTEM_TEMPERATURE_OID in previous context
HUAWEI_OLT_PORT_TX_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.23.1.4'
HUAWEI_OLT_PORT_RX_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.23.1.5'
HUAWEI_OLT_PORT_LAST_UPTIME_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.21.1.17' # hwPonIfUpTime
HUAWEI_OLT_VOLTAGE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.23.1.2'
HUAWEI_OLT_BIAS_CURRENT_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.23.1.3'
HUAWEI_OLT_PORT_DESCRIPTION_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.21.1.6' # hwPonIfDescription
HUAWEI_OLT_PORT_ONT_COUNT_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.21.1.16' # hwPonIfOpticalOnlineNum
HUAWEI_OLT_PORT_STATUS_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.21.1.10' # hwPonIfAdminStat / hwPonIfOperStat
HUAWEI_OLT_PORT_LAST_DOWN_TIME_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.21.1.18'
HUAWEI_OLT_PORT_LAST_DOWN_CAUSE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.21.1.19'

# Huawei ONT Specific OIDs
HUAWEI_ONT_ACTIVE_STATUS_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.46.1.15' # hwGponDeviceOntOnlineState
HUAWEI_ONT_TX_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.3'
HUAWEI_ONT_RX_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.4'
HUAWEI_ONT_VOLTAGE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.5'
HUAWEI_ONT_OLT_RX_OPTICAL_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.6' # hwGponDeviceOntOpticalPowerReceivedFromOlt
HUAWEI_ONT_TEMPERATURE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.1'

import os

def compile_mib(mib_source_path, output_dir):
    """
    Compile a MIB file to PySNMP format using pysmi.

    Args:
        mib_source_path (str): Path to the source MIB file (.mib or .txt).
        output_dir (str): Directory to store the compiled Python MIB module.

    Returns:
        str: Path to the compiled Python MIB file, or error message.
    """
    try:
        from pysmi.reader.localfile import FileReader
        from pysmi.writer.localfile import FileWriter
        from pysmi.parser.smi import parserFactory
        from pysmi.codegen.pysnmp import PySnmpCodeGen
        from pysmi.compiler import MibCompiler
        # from pysmi import debug
        # debug.setLogger(debug.Debug('all'))  # Uncomment for verbose output

        compiler = MibCompiler(
            parserFactory(),
            PySnmpCodeGen(),
            FileWriter(output_dir)
        )
        compiler.addSources(FileReader(mib_source_path))
        result = compiler.compile(os.path.splitext(os.path.basename(mib_source_path))[0])
        return f"Compile result: {result}"
    except Exception as e:
        return f"Failed to compile MIB: {e}"

def compile_all_mibs():
    """
    Compile all MIB files in the project mibs/src directory to mibs/compiled.
    """
    PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MIB_SRC_DIR = os.path.join(PROJECT_ROOT, 'mibs', 'src')
    MIB_COMPILED_DIR = os.path.join(PROJECT_ROOT, 'mibs', 'compiled')
    if not os.path.exists(MIB_COMPILED_DIR):
        os.makedirs(MIB_COMPILED_DIR)
    if not os.path.exists(MIB_SRC_DIR):
        print(f"MIB source directory does not exist: {MIB_SRC_DIR}")
        return
    for filename in os.listdir(MIB_SRC_DIR):
        if filename.lower().endswith(('.mib', '.txt','MIB')):
            mib_path = os.path.join(MIB_SRC_DIR, filename)
            result = compile_mib(mib_path, MIB_COMPILED_DIR)
            print(f"{filename}: {result}")
    return "completed"

def generate_snmp_packet(slot_num, port_num, onu_id=None):
    # Ensure slot_num and port_num are integers and are within valid range
    if not (0 <= slot_num < 16):  # Assuming 4 bits for slot_num (0-15)
        raise ValueError("Invalid slot number. It must be between 0 and 15.")
    if not (0 <= port_num < 16):  # Assuming 4 bits for port_num (0-15)
        raise ValueError("Invalid port number. It must be between 0 and 15.")

    # Construct the base SNMP index (left part)
    left_part = (slot_num << 13) | (port_num << 8)

    # Generate the SNMP index packet as a string
    if onu_id is not None:
        # If ONU ID is provided, append it
        return f"{4194304000 + left_part}.{onu_id}"
    else:
        # Return the packet without ONU ID
        return str(4194304000 + left_part)

async def get_snmp_data(host, community, oid, slot_num, port_num, onu_id=None, snmp_port=161):
    """
    Async function to get a single SNMP value using SNMPv2c.
    Returns the parsed value (e.g., int, str), or None if error or no value.
    """
    index = generate_snmp_packet(slot_num, port_num, onu_id)
    oid_with_index = f"{oid}.{index}"

    # Hardcode SNMPv2c
    auth_data = CommunityData(community, mpModel=1) 

    try:
        transport_target = await UdpTransportTarget.create((host, snmp_port))
        errorIndication, errorStatus, errorIndex, varBinds = await get_cmd( # Changed from getCmd to get_cmd
            SnmpEngine(),
            auth_data,
            transport_target,
            ContextData(),
            ObjectType(ObjectIdentity(oid_with_index))
        )

        if errorIndication:
            # print(f"SNMP error for {host} OID {oid_with_index}: {errorIndication}")
            return None
        elif errorStatus:
            # print(f"SNMP error for {host} OID {oid_with_index}: {errorStatus.prettyPrint()} at {errorIndex and varBinds[int(errorIndex) - 1][0] or '?'}")
            return None # NoSunchName, NoSunchInstance will fall here
        else:
            if varBinds and varBinds[0]:
                value = varBinds[0][1] # ObjectSyntax instance
                if value.isSameTypeWith(Null()): # Check for NoSunchInstance or EndOfMibView
                    return None
                # Return the raw string representation as in the original function's successful case
                return str(" = ".join([x.prettyPrint() for x in varBinds[0]]))
            return None # No varBinds returned
    except ConnectionRefusedError:
        # print(f"SNMP connection refused for {host}:{snmp_port} OID {oid_with_index}")
        return None
    except Exception as e:
        # print(f"Exception in get_snmp_data for {host} OID {oid_with_index}: {str(e)}")
        return None

def get_ont_info_per_port(ip,community,slot_num,number_of_ports): # This function still uses asyncio.run()
    ports = number_of_ports
    results = []
    for port in range(ports): # This loop will be slow due to asyncio.run()
        port_desc_raw = asyncio.run(get_snmp_data(ip,community,HUAWEI_OLT_PORT_DESCRIPTION_OID,slot_num,port))
        port_desc = port_desc_raw.split('=')[-1].strip() if port_desc_raw else "N/A"
        
        port_status_raw = asyncio.run(get_snmp_data(ip,community,HUAWEI_OLT_PORT_STATUS_OID,slot_num,port))
        port_status = port_status_raw.split('=')[-1].strip() if port_status_raw else "N/A"
        
        number_of_olt_raw = asyncio.run(get_snmp_data(ip,community,HUAWEI_OLT_PORT_ONT_COUNT_OID,slot_num,port))
        number_of_olt = int(number_of_olt_raw.split('=')[-1].strip()) if number_of_olt_raw else 0
        
        tx_power_raw = asyncio.run(get_snmp_data(ip,community,HUAWEI_OLT_PORT_TX_POWER_OID,slot_num,port))
        tx_power_str = tx_power_raw.split('=')[-1].strip() if tx_power_raw else "0"
        
        rx_power_raw = asyncio.run(get_snmp_data(ip,community,HUAWEI_OLT_PORT_RX_POWER_OID,slot_num,port))
        rx_power_str = rx_power_raw.split('=')[-1].strip() if rx_power_raw else "0"
        
        online = 0
        count = 0
        # The ONT status loop still has hardcoded IP/community/slot
        for ontid in range(128): 
            ont_status_raw = asyncio.run(get_snmp_data("172.20.100.2",'pveT]jFu3y4r',HUAWEI_ONT_ACTIVE_STATUS_OID,2,port,ontid))
            try:
                if ont_status_raw:
                    ont_status_val = int(ont_status_raw.split('=')[-1].strip())
                    count = count + 1
                    if ont_status_val == 1:
                        online = online  + 1
            except (ValueError, TypeError, AttributeError): # Catch if split fails or int conversion fails
                continue
            if count == number_of_olt:
                break
        results.append({
            "port_id" : port,
            "online" : online,
            "number_of_olt" : number_of_olt,
            "port_desc" : port_desc,
            "port_status" : port_status,
            "tx_power" : float(tx_power_str) * 0.01,
            "rx_power" : float(rx_power_str) * 0.01,
        })
    
    return results

# async def _walk_snmp_table(snmp_engine, auth_data, transport_target, oids_to_walk, table_base_oid):
#     """Helper function to walk specified OIDs in an SNMP table."""
#     results = {}
#     iterator = await next_cmd(
#             snmp_engine,
#             auth_data,
#             transport_target,
#             ContextData(),
#             *oids_to_walk,
#             lexicographicMode=False
#     )
#     errorIndication, errorStatus, errorIndex, varBinds = iterator
#     if errorIndication:
#         print(f"SNMP walk error: {errorIndication}")
#         raise Exception(f"SNMP walk error: {errorIndication}")
#     elif errorStatus:
#         error_msg = f"SNMP walk error: {errorStatus.prettyPrint()} at {errorIndex and varBinds[int(errorIndex) - 1][0] or '?'}"
#         print(error_msg)
#         raise Exception(error_msg)
#     else:
#         # Check if we are still within the table for the first OID walked
#         if not varBinds[0][0].isPrefixOf(ObjectIdentity(table_base_oid)):
#             return

#         entry_index_tuple = varBinds[0][0].getSuffix() # Suffix is the index of the table entry
#         entry_index_str = '.'.join(map(str, entry_index_tuple))

#         if entry_index_str not in results:
#             results[entry_index_str] = {}

#         for oid_obj, val_obj in varBinds:
#             # Store the value against the base OID that was walked
#             # Find which of the oids_to_walk this oid_obj corresponds to
#             for walked_oid_type in oids_to_walk:
#                 walked_base_oid_str = str(walked_oid_type.getOid())
#                 if str(oid_obj).startswith(walked_base_oid_str):
#                     results[entry_index_str][walked_base_oid_str] = val_obj
#                     break
#     return results

# async def get_installed_board_info_snmp(host, community, snmp_version='v2c', snmp_port=161, frame_id='0'):
#     """
#     Retrieves installed board information using SNMP (ENTITY-MIB and IF-MIB).
#     Tries to match the output structure of board_utils.get_installed_board_info.
#     """
#     snmp_engine = SnmpEngine()
#     auth_data = None
#     if snmp_version.lower() == 'v1':
#         auth_data = CommunityData(community, mpModel=0)
#     elif snmp_version.lower() == 'v2c':
#         auth_data = CommunityData(community, mpModel=1)
#     else:
#         raise ValueError(f"Unsupported SNMP version: {snmp_version}")

#     transport_target = await UdpTransportTarget.create((host, snmp_port))

#     # 1. Discover physical entities (potential cards) using ENTITY-MIB
#     ent_oids_to_walk = [
#         ObjectType(ObjectIdentity(OID_ENT_PHYSICAL_CLASS)),
#         ObjectType(ObjectIdentity(OID_ENT_PHYSICAL_DESCR)),
#         ObjectType(ObjectIdentity(OID_ENT_PHYSICAL_PARENT_REL_POS)),
#         ObjectType(ObjectIdentity(OID_ENT_PHYSICAL_MODEL_NAME)),
#         ObjectType(ObjectIdentity(OID_ENT_PHYSICAL_OPER_STATUS)),
#         ObjectType(ObjectIdentity(OID_ENT_PHYSICAL_NAME)),
#     ]
#     physical_entities = await _walk_snmp_table(snmp_engine, auth_data, transport_target, ent_oids_to_walk, OID_ENT_PHYSICAL_TABLE)

#     # 2. Discover interfaces using IF-MIB to count ports
#     if_oids_to_walk = [
#         ObjectType(ObjectIdentity(OID_IF_DESCR)),
#         ObjectType(ObjectIdentity(OID_IF_TYPE)), # To filter for physical-like ports
#     ]
#     interfaces = await _walk_snmp_table(snmp_engine, auth_data, transport_target, if_oids_to_walk, OID_IF_TABLE)

#     discovered_boards = []
#     for ent_idx, entity_data in physical_entities.items():
#         ent_class = entity_data.get(OID_ENT_PHYSICAL_CLASS)
#         if ent_class and int(ent_class) == 9:  # entPhysicalClass 9 is 'module' (typically a card)
#             slot_num_val = entity_data.get(OID_ENT_PHYSICAL_PARENT_REL_POS)
#             slot_num = int(slot_num_val) if slot_num_val is not None else -1

#             # Attempt to match frame_id if entity name/description contains it.
#             # entPhysicalName might contain something like "Slot 0" or "Board 0/1"
#             # This part is highly vendor-dependent for precise frame/slot matching from ENTITY-MIB.
#             # For simplicity, we're taking all class 9 modules. Refine if needed.

#             board_name_val = entity_data.get(OID_ENT_PHYSICAL_MODEL_NAME) or entity_data.get(OID_ENT_PHYSICAL_DESCR)
#             board_name = str(board_name_val) if board_name_val else "Unknown Board"

#             oper_status_val = entity_data.get(OID_ENT_PHYSICAL_OPER_STATUS)
#             status_str = "Unknown"
#             online_status_str = "Unknown" # SSH script has 'Online'/'Offline'
#             if oper_status_val:
#                 oper_status = int(oper_status_val)
#                 if oper_status == 1: status_str, online_status_str = "Normal", "Online" # up
#                 elif oper_status == 2: status_str, online_status_str = "Offline", "Offline" # down
#                 elif oper_status == 3: status_str, online_status_str = "Testing", "Online" # testing

#             # Count ports for this card by matching ifDescr
#             port_count = 0
#             # Construct a regex pattern to match interfaces for this slot, e.g., "Eth0/1/", "PON 0/1/"
#             # This is a generic attempt; Huawei might have specific naming.
#             # Example: ifDescr often contains "slot/port" or "frame/slot/port"
#             # We need a reliable way to link ifDescr to the entPhysicalParentRelPos (slot_num)
#             # For Huawei, ifDescr might be like "GigabitEthernet0/3/0" where 3 is slot.
#             # This part is complex and vendor-specific.
#             # A simpler approach for now: if the card is a PON card, count PON ports using Huawei specific OIDs if possible,
#             # or count all physical interfaces whose ifDescr seems to belong to this slot.
#             # The SSH script's `display port desc {frame}/{slot_id}` is more direct.
#             # Placeholder for port_count, as reliable SNMP counting is complex.

#             discovered_boards.append({
#                 "slot": slot_num,
#                 "board_name": board_name,
#                 "status": status_str,
#                 "online_status": online_status_str, # From entPhysicalOperStatus
#                 "port_count": 0,  # Placeholder: Accurate port count per card via SNMP is complex
#             })

#     return {
#         "data": {
#             "total_slots": -1, # Placeholder: Determining total slots via ENTITY-MIB is complex
#             "installed_cards": len(discovered_boards),
#             "boards": sorted(discovered_boards, key=lambda x: x['slot'])
#         }
#     }

def get_ssh_metrics(host, username, password, board):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password)
    channel = ssh.invoke_shell()
    time.sleep(1)
    channel.recv(9999)
    channel.send("enable\n")
    time.sleep(2)
    channel.send("display sysuptime\n")
    time.sleep(2)
    channel.send("\n")
    time.sleep(2)
    output = channel.recv(5000).decode('utf-8')
    pattern = r'System up time:\s*(\d+)\s*day\s*(\d+)\s*hour\s*(\d+)\s*minute\s*(\d+)\s*second'
    match = re.search(pattern, output)
    if match:
        days, hours, minutes, seconds = map(int, match.groups())
        uptime = f"{days}days {hours}hrs {minutes}min {seconds}s"
    else:
        uptime = None
    channel.send(f"display cpu {board}\n")
    time.sleep(2)
    channel.send("\n")
    time.sleep(2)
    output = channel.recv(5000).decode('utf-8')
    match = re.search(r'CPU occupancy:\s*(\d+)%', output)
    cpu_usage = int(match.group(1)) if match else None
    channel.send(f"display mem {board}\n")
    time.sleep(2)
    channel.send("\n")
    time.sleep(2)
    output = channel.recv(5000).decode('utf-8')
    match = re.search(r'Memory occupancy:\s*(\d+)%', output)
    mem_usage = int(match.group(1)) if match else None
    command = f"display temperature {board}\n"
    channel.send(command)
    time.sleep(2)
    channel.send("\n")
    time.sleep(2)
    output = channel.recv(5000).decode('utf-8')
    match = re.search(r'The temperature of the board:\s+(\d+)C', output)
    temp_c = int(match.group(1)) if match else None
    channel.send(f"display board desc 0\n")
    time.sleep(2)
    channel.send("\n")
    time.sleep(2)
    output = channel.recv(5000).decode("utf-8")
    board_lines = re.findall(r"\d+/\s*\d+\s+(\S+)", output)
    installed_cards = [desc for desc in board_lines if desc.strip() != ""]
    total_cards = len(installed_cards)
    channel.close()
    ssh.close()
    return {
        "uptime": uptime,
        "cpu": cpu_usage,
        "memory": mem_usage,
        "temperature": temp_c,
        "total_cards": total_cards
    }

def get_system_metrics(host, ssh_username, ssh_password, board=None):
    """Get system metrics via SSH only. Defaults board to '0/2' if not provided."""
    if not board:
        board = '0/2'
    print(f"[SSH DEBUG] get_system_metrics called with host={host}, ssh_username={ssh_username}, board={board}")
    try:
        metrics = get_ssh_metrics(host, ssh_username, ssh_password, board)
        metrics['status'] = 'success'
        metrics['error'] = None
        # print(f"[SSH DEBUG] Final metrics: {metrics}")
        return metrics
    except Exception as e:
        print(f"[SSH DEBUG] Exception: {e}")
        return {
            'status': 'error',
            'error': str(e)
        }

async def _fetch_one_port_details_async(ip, community, slot_num, port_id, snmp_port=161):
    """Helper to fetch all details for a single PON port asynchronously."""
    # These calls will run concurrently for different OIDs of the same port
    port_desc_task = get_snmp_data(ip, community, HUAWEI_OLT_PORT_DESCRIPTION_OID, slot_num, port_id, snmp_port=snmp_port)
    port_status_task = get_snmp_data(ip, community, HUAWEI_OLT_PORT_STATUS_OID, slot_num, port_id, snmp_port=snmp_port)
    ont_count_task = get_snmp_data(ip, community, HUAWEI_OLT_PORT_ONT_COUNT_OID, slot_num, port_id, snmp_port=snmp_port)
    tx_power_task = get_snmp_data(ip, community, HUAWEI_OLT_PORT_TX_POWER_OID, slot_num, port_id, snmp_port=snmp_port)
    rx_power_task = get_snmp_data(ip, community, HUAWEI_OLT_PORT_RX_POWER_OID, slot_num, port_id, snmp_port=snmp_port)

    # Await all tasks for this port
    port_desc_raw, port_status_raw, number_of_olt_raw, tx_power_raw, rx_power_raw = await asyncio.gather(
        port_desc_task, port_status_task, ont_count_task, tx_power_task, rx_power_task
    )

    port_desc = port_desc_raw.split('=')[-1].strip() if port_desc_raw else "N/A"
    port_status = port_status_raw.split('=')[-1].strip() if port_status_raw else "N/A"
    
    number_of_olt = 0
    if number_of_olt_raw:
        try:
            number_of_olt = int(number_of_olt_raw.split('=')[-1].strip())
        except (ValueError, IndexError):
            number_of_olt = 0 # Default if parsing fails
            
    tx_power_str = tx_power_raw.split('=')[-1].strip() if tx_power_raw else "0"
    rx_power_str = rx_power_raw.split('=')[-1].strip() if rx_power_raw else "0"

    online_onts = 0
    if number_of_olt > 0:
        ont_status_tasks = []
        # Fetch status for each potentially configured ONT. Huawei might allow up to 128.
        # We limit to number_of_olt or a practical max like 128.
        # The OID for ONT status often includes the ONT index (0-127).
        for ont_idx in range(min(number_of_olt, 128)): # Iterate up to actual ONT count or 128
            ont_status_tasks.append(
                get_snmp_data(ip, community, HUAWEI_ONT_ACTIVE_STATUS_OID, slot_num, port_id, ont_idx, snmp_port=snmp_port)
            )
        
        if ont_status_tasks:
            ont_results_raw = await asyncio.gather(*ont_status_tasks, return_exceptions=True)
            for res_raw in ont_results_raw:
                if isinstance(res_raw, Exception) or not res_raw:
                    continue
                try:
                    ont_status_val_str = res_raw.split('=')[-1].strip()
                    if ont_status_val_str.isdigit():
                        ont_status_val = int(ont_status_val_str)
                        if ont_status_val == 1: # Assuming 1 means online
                            online_onts += 1
                except (ValueError, TypeError, AttributeError, IndexError):
                    continue # Ignore parsing errors for individual ONT status
    
    tx_p = 0.0
    rx_p = 0.0
    try:
        tx_p = float(tx_power_str) * 0.01
    except ValueError:
        pass # Keep 0.0 if conversion fails
    try:
        rx_p = float(rx_power_str) * 0.01
    except ValueError:
        pass # Keep 0.0 if conversion fails

    return {
        "port_id": port_id, # This is port_index_on_card
        "online": online_onts,
        "number_of_olt": number_of_olt, # Total configured ONTs on this port
        "port_desc": port_desc,
        "port_status": port_status,
        "tx_power": tx_p,
        "rx_power": rx_p,
    }

async def get_ont_info_per_slot_async(ip, community, slot_num, number_of_ports, snmp_port=161):
    """Fetches ONT info for all ports on a slot concurrently."""
    port_detail_tasks = []
    for port_idx in range(number_of_ports):
        port_detail_tasks.append(
            _fetch_one_port_details_async(ip, community, slot_num, port_idx, snmp_port)
        )
    
    all_ports_data = await asyncio.gather(*port_detail_tasks, return_exceptions=True)
    
    results = []
    
    for data in all_ports_data:
        if isinstance(data, Exception):
            # Log the exception or handle it as needed
            print(f"Error fetching details for a port in slot {slot_num}: {data}")
            # Optionally add a placeholder or skip
        elif data: # Ensure data is not None or empty
            results.append(data)
    return results

# Example of calling it (e.g., in an async task or view)
# from .utils.snmp_utils import get_installed_board_info_snmp
# import asyncio

# async def main_test():
#     host = "172.20.100.2"
#     community = "pveT]jFu3y4r"
#     try:
#         board_info = await get_installed_board_info_snmp(host, community)
#         print(json.dumps(board_info, indent=2))
#     except Exception as e:
#         print(f"Error: {e}")

if __name__ == "__main__":
    #print(compile_all_mibs())
    #get_system_metrics("172.20.100.2",'splynx',"Dotmac@Splynx1")
    #asyncio.run(main_test())
    print()
