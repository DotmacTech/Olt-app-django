import paramiko
import re
import json
import time
import asyncio
import datetime # <--- ADD THIS IMPORT
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
HUAWEI_ONT_SERIAL_NUMBER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.43.1.3' # hwGponDeviceOntSn (Hex String)
HUAWEI_ONT_ACTIVE_STATUS_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.46.1.15' # hwGponDeviceOntOnlineState
HUAWEI_ONT_TX_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.3'
HUAWEI_ONT_RX_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.4'
HUAWEI_ONT_VOLTAGE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.5'
HUAWEI_ONT_OLT_RX_OPTICAL_POWER_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.6' # hwGponDeviceOntOpticalPowerReceivedFromOlt
HUAWEI_ONT_TEMPERATURE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.51.1.1'
HUAWEI_ONT_LAST_DOWN_TIME_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.46.1.23' # hwGponDeviceOntLastDownTime (DateAndTime)
HUAWEI_ONT_LAST_DOWN_CAUSE_OID = '1.3.6.1.4.1.2011.6.128.1.1.2.46.1.24' # hwGponDeviceOntLastDownCause (Integer)


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
                oid_returned, value_returned = varBinds[0] # oid_returned is ObjectIdentity, value_returned is ObjectSyntax
                
                if value_returned.isSameTypeWith(Null()): # Check for NoSunchInstance or EndOfMibView
                    return None
                # For DateAndTime, return the ObjectSyntax instance itself for further parsing
                if oid == HUAWEI_ONT_LAST_DOWN_TIME_OID: # Compare with the base OID passed in
                    return value_returned 
                # For others, return the raw string representation
                return str(" = ".join([x.prettyPrint() for x in varBinds[0]]))
            return None # No varBinds returned
    except ConnectionRefusedError:
        # print(f"SNMP connection refused for {host}:{snmp_port} OID {oid_with_index}")
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
            ont_status_raw = asyncio.run(get_snmp_data(ip,community,HUAWEI_ONT_ACTIVE_STATUS_OID,slot_num,port,ontid))
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
        for ont_idx in range(min(number_of_olt+1, 128)): # Iterate up to actual ONT count or 128
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

def parse_snmp_date_and_time(octet_string_val):
    """
    Parses an SNMP DateAndTime octet string into a datetime object.
    DateAndTime is an OCTET STRING, typically 8 or 11 bytes.
    Format: YYYY-MM-DD,HH:MM:SS.S[+/-HH:MM]
    Octets:
      1-2: Year (big-endian)
      3:   Month
      4:   Day
      5:   Hour
      6:   Minute
      7:   Second
      8:   Deci-seconds
      (Optional, if 11 bytes)
      9:   Direction from UTC ('+' or '-')
      10:  Hours from UTC
      11:  Minutes from UTC
    Returns a datetime object (naive, UTC if no offset) or None.
    """
    if not octet_string_val or not hasattr(octet_string_val, 'asOctets'):
        # print(f"DEBUG parse_snmp_date_and_time: octet_string_val is None or not an ObjectSyntax instance: {octet_string_val}")
        return None
    
    octets = octet_string_val.asOctets()
    length = len(octets)
    # print(f"DEBUG parse_snmp_date_and_time: Received octets (len={length}): {octets.hex() if octets else 'empty'}")

    if length not in (8, 11):
        # print(f"DEBUG parse_snmp_date_and_time: Invalid DateAndTime length: {length}, octets: {octets.hex() if octets else 'empty'}")
        return None
    

    try:
        year = (octets[0] << 8) + octets[1]
        month = octets[2]
        day = octets[3]
        hour = octets[4]
        minute = octets[5]
        second = octets[6]
        # deci_seconds = octets[7] # We'll ignore deci-seconds for simplicity

        dt = datetime.datetime(year, month, day, hour, minute, second)

        if length == 11:
            direction = chr(octets[8])
            offset_hours = octets[9]
            offset_minutes = octets[10]
            
            offset_delta = datetime.timedelta(hours=offset_hours, minutes=offset_minutes)
            if direction == '-':
                dt += offset_delta # If it's -UTC, add to get to UTC
            elif direction == '+':
                dt -= offset_delta # If it's +UTC, subtract to get to UTC
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt
    except ValueError as e:
        print(f"DEBUG parse_snmp_date_and_time: ValueError parsing DateAndTime '{octets.hex()}': {e}")
        return None
    except Exception as e:
        print(f"DEBUG parse_snmp_date_and_time: Generic error parsing DateAndTime '{octets.hex()}': {e}")
        return None

async def _fetch_one_ont_details_async(ip, community, slot_num, port_num, ont_idx, snmp_port=161):
    """Helper to fetch all details for a single ONT asynchronously."""
    sn_task = get_snmp_data(ip, community, HUAWEI_ONT_SERIAL_NUMBER_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port)
    status_task = get_snmp_data(ip, community, HUAWEI_ONT_ACTIVE_STATUS_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port)
    rx_at_ont_task = get_snmp_data(ip, community, HUAWEI_ONT_RX_POWER_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port)
    tx_at_ont_task = get_snmp_data(ip, community, HUAWEI_ONT_TX_POWER_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port)
    rx_at_olt_task = get_snmp_data(ip, community, HUAWEI_ONT_OLT_RX_OPTICAL_POWER_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port)
    last_down_time_task = get_snmp_data(ip, community, HUAWEI_ONT_LAST_DOWN_TIME_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port) # This will return ObjectSyntax
    last_down_cause_task = get_snmp_data(ip, community, HUAWEI_ONT_LAST_DOWN_CAUSE_OID, slot_num, port_num, ont_idx, snmp_port=snmp_port)

    sn_raw, status_raw, rx_ont_raw, tx_ont_raw, rx_olt_raw, ldt_obj_syntax, ldc_raw = await asyncio.gather(
        sn_task, status_task, rx_at_ont_task, tx_at_ont_task, rx_at_olt_task, last_down_time_task, last_down_cause_task,
        return_exceptions=True # Allow individual tasks to fail
    )

    # print(f"DEBUG SNMP UTIL _fetch_one_ont: OLT={ip}, Slot={slot_num}, Port={port_num}, ONT_IDX={ont_idx} :: SN_RAW='{sn_raw}', STATUS_RAW='{status_raw}'")

    # Helper to parse raw SNMP string "OID = TYPE: Value"
    def parse_val(raw, data_type_converter=str):
        if isinstance(raw, Exception) or not raw:
            return None
        try:
            # Example raw strings:
            # "SNMPv2-SMI::enterprises.2011.6.128.1.1.2.43.1.3.4194320384.0 = Hex-STRING: 485754437d4630c3"
            # "SNMPv2-SMI::enterprises.2011.6.128.1.1.2.46.1.15.4194320384.0 = INTEGER: 2"
            # "SNMPv2-SMI::enterprises.2011.6.128.1.1.2.43.1.3.4194320384.2 = No Such Instance currently exists at this OID"
            
            if "No Such Instance" in raw or "No Such Object" in raw:
                return None
            
            # Split by " = " to separate OID from TYPE: Value
            parts = raw.split(" = ", 1)
            if len(parts) < 2: # Should not happen if format is consistent
                return None 
            
            type_and_value_part = parts[1]
            
            # Split by ": " to separate TYPE from Value (use maxsplit=1)
            val_str = type_and_value_part.split(": ", 1)[-1].strip()

            return data_type_converter(val_str)
        except: return None

    serial_number_hex = parse_val(sn_raw) # e.g., "48575443EA7508A0"
    # print(f"DEBUG SNMP UTIL _fetch_one_ont: OLT={ip}, Slot={slot_num}, Port={port_num}, ONT_IDX={ont_idx} :: serial_number_hex='{serial_number_hex}'")
    
    # For Hex-STRING, the value might be prefixed with "0x" by some SNMP libraries/devices, or not.
    # bytes.fromhex() does not want "0x".
    processed_hex_for_sn = None
    if serial_number_hex:
        if serial_number_hex.lower().startswith("0x"):
            processed_hex_for_sn = serial_number_hex[2:]
        else:
            processed_hex_for_sn = serial_number_hex
            
    # Process serial number for a more readable format: VENDOR_ASCII_PREFIX + UNIQUE_ID_HEX_SUFFIX
    serial_number_to_return = None
    if processed_hex_for_sn:
        # Standard vendor prefix is 4 chars (8 hex digits)
        if len(processed_hex_for_sn) >= 8:
            vendor_hex_part = processed_hex_for_sn[:8]
            id_hex_part = processed_hex_for_sn[8:]
            try:
                vendor_ascii_part = bytes.fromhex(vendor_hex_part).decode('ascii')
                # Keep only alphanumeric characters from the decoded vendor prefix
                cleaned_vendor_ascii = "".join(filter(str.isalnum, vendor_ascii_part))
                
                if cleaned_vendor_ascii: # Ensure we got a non-empty alphanumeric prefix
                    serial_number_to_return = f"{cleaned_vendor_ascii.upper()}{id_hex_part.upper()}"
                else:
                    # If cleaned prefix is empty, the original vendor part was not suitable.
                    # Fallback to full hex string to avoid '????' or similar from 'replace' if it was all non-alnum.
                    serial_number_to_return = processed_hex_for_sn.upper()
            except (UnicodeDecodeError, ValueError): # ValueError for invalid hex
                # If vendor part is not ASCII or hex is invalid, use the full hex string.
                serial_number_to_return = processed_hex_for_sn.upper()
        else:
            # If too short for standard format, just use the hex string as is.
            serial_number_to_return = processed_hex_for_sn.upper()

    serial_number = serial_number_to_return # This variable will be used in the return dict
    # print(f"DEBUG SNMP UTIL _fetch_one_ont: OLT={ip}, Slot={slot_num}, Port={port_num}, ONT_IDX={ont_idx} :: final_serial_number='{serial_number}'")

    ont_status_map = {"1": "online", "2": "offline"} # Example mapping
    status_code = parse_val(status_raw, int)
    status = ont_status_map.get(str(status_code), "unknown") if status_code is not None else "unknown"

    # Helper to parse power values, convert to dBm, and handle placeholders
    def power_value_converter(raw_snmp_value_string):
        value_str_from_snmp = parse_val(raw_snmp_value_string, str) # Extracts "VALUE" from "OID = TYPE: VALUE"

        if value_str_from_snmp is None:
            return None
        try:
            num_int = int(value_str_from_snmp)
            if num_int == 2147483647: # Placeholder for "not available" or error
                return None
            return float(num_int) * 0.01 # Convert from 0.01dBm units to dBm
        except ValueError:
            # print(f"Warning: Power value string '{value_str_from_snmp}' is not a simple integer. Raw: {raw_snmp_value_string}")
            return None

    rx_power_at_ont = power_value_converter(rx_ont_raw)
    tx_power_at_ont = power_value_converter(tx_ont_raw)
    rx_power_at_olt = power_value_converter(rx_olt_raw)

    last_down_time = parse_snmp_date_and_time(ldt_obj_syntax) if not isinstance(ldt_obj_syntax, Exception) else None # ldt_obj_syntax is the ObjectSyntax itself
    
    # Last down cause mapping (example, needs to be verified for Huawei)
    # 1: dying-gasp, 2: losi, 3: lofi, 4: sfi, 5: loai, 6: loami, etc.
    # Updated based on hwGponDeviceOntControlLastDownCause 1.3.6.1.4.1.2011.6.128.1.1.2.46.1.24
    last_down_cause_code = parse_val(ldc_raw, int)
    last_down_cause_map = {
        1: "LOS (Loss of signal)",
        2: "LOSi (Loss of signal for ONUi)",
        3: "LOFi (Loss of frame of ONUi)",
        4: "SFi (Signal fail of ONUi)",
        5: "LOAi (Loss of acknowledge with ONUi)",
        6: "LOAMi (Loss of PLOAM for ONUi)",
        7: "Deactive ONT fails",
        8: "Deactive ONT success",
        9: "Reset ONT",
        10: "Re-register ONT",
        11: "Pop up fail",
        13: "Dying-gasp",
        15: "LOKI (Loss of key synch with ONUi)",
        -1: "Query fails"
    }
    last_down_cause = last_down_cause_map.get(last_down_cause_code, str(last_down_cause_code) if last_down_cause_code is not None else "unknown")

    # If ONT is offline, power levels are often irrelevant or misleading, set to None
    if status == "offline":
        rx_power_at_ont = None
        tx_power_at_ont = None
        rx_power_at_olt = None

    if not serial_number: # If no serial number, this ONT entry is likely not valid/configured
        # print(f"DEBUG SNMP UTIL _fetch_one_ont: No serial number found for OLT={ip}, Slot={slot_num}, Port={port_num}, ONT_IDX={ont_idx}, returning None.")
        return None

    return {
        "serial_number": serial_number,
        "ont_index_on_port": ont_idx,
        "status": status,
        "rx_power_at_ont": rx_power_at_ont,
        "tx_power_at_ont": tx_power_at_ont,
        "rx_power_at_olt": rx_power_at_olt,
        "last_down_time": last_down_time,
        "last_down_cause": last_down_cause,
    }

async def get_all_ont_details_for_pon_port_async(ip, community, slot_num, port_num, num_configured_onts, snmp_port=161):
    """Fetches details for all configured ONTs on a specific PON port."""
    ont_detail_tasks = []
    # Huawei typically supports up to 128 ONTs per port (index 0-127)
    # We iterate up to the number of configured ONTs reported by the OLT for that port,
    # or a practical limit like 128 if num_configured_onts is unexpectedly high or zero.
    # If num_configured_onts is 0, we might still try to discover a few to see if any respond.
    limit = min(max(num_configured_onts, 32), 128) # Try at least 32, max 128, or num_configured
    if num_configured_onts == 0: # If OLT reports 0, maybe it's an error, try a few.
        limit = 32 

    for ont_idx in range(limit):
        ont_detail_tasks.append(
            _fetch_one_ont_details_async(ip, community, slot_num, port_num, ont_idx, snmp_port)
        )
    
    all_onts_data_raw = await asyncio.gather(*ont_detail_tasks, return_exceptions=True)
    
    results = []
    for data in all_onts_data_raw:
        if isinstance(data, Exception):
            # print(f"Error fetching details for an ONT on {slot_num}/{port_num}: {data}")
            continue
        if data and data.get("serial_number"): # Ensure it's a valid ONT record
            results.append(data)
    return results

if __name__ == "__main__":
    #print(compile_all_mibs())
    #get_system_metrics("172.20.100.2",'splynx',"Dotmac@Splynx1")
    #asyncio.run(main_test())
    print(asyncio.run(get_all_ont_details_for_pon_port_async("172.20.100.2","pveT]jFu3y4r",2,1,7)))
    print()