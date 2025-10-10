import paramiko
import re
import time
import telnetlib3
import sys
from datetime import datetime

def log(message, error=False):
    timestamp = datetime.now().strftime('%H:%M:%S')
    prefix = '[ERROR]' if error else '[INFO] '
    # print(f"[{timestamp}]{prefix} {message}", file=sys.stderr if error else sys.stdout)

async def get_installed_board_info(host, username, password, frame='0'):
    reader = writer = None
    try:
        #log(f"Connecting to {host}...")
        reader, writer = await telnetlib3.open_connection(host, 23, encoding='ascii')
        #log("Connection established")
        
        # Initial read to get login prompt
        output = await reader.read(1024)
        #log(f"Initial output: {output[:100]}...")
        
        # Login sequence
        if "User name:" in output or "login:" in output.lower():
            #log("Sending username...")
            writer.write(f"{username}\n")
            await asyncio.sleep(1)
            output = await asyncio.wait_for(reader.read(1024), timeout=10)
            #log(f"After username: {output[:200]}...")
            
        if "User password:" in output:
            #log("Sending password...")
            writer.write(f"{password}\n")
            await asyncio.sleep(1)
            output = await asyncio.wait_for(reader.read(1024), timeout=10)
            #log(f"After password: {output[:200]}...")
        
        # Enter enable mode if needed
        writer.write("enable\n")
        await asyncio.sleep(1)
        output = await asyncio.wait_for(reader.read(1024), timeout=10)
        #log(f"After enable: {output[:200]}...")
        
        # Enter config mode
        writer.write("config\n")
        await asyncio.sleep(1)
        output = await asyncio.wait_for(reader.read(1024), timeout=10)
        #log(f"After config: {output[:200]}...")
        
        # Get board information
        writer.write(f"display board {frame}\n")
        await asyncio.sleep(2)
        writer.write("\n")
        await asyncio.sleep(2)
        output = await asyncio.wait_for(reader.read(8000), timeout=15)
        board_data = []
        for line in output.splitlines():
            match = re.match(r"\s*(\d+)\s+(\w+)\s+([\w_]+)(.*)", line)
            if match:
                slot_id = match.group(1)
                board_name = match.group(2)
                status = match.group(3)
                other = match.group(4).strip()
                online_status = 'Online'
                if 'Offline' in other:
                    online_status = 'Offline'
                writer.write(f"display port desc {frame}/{slot_id}\n")
                await asyncio.sleep(2)
                writer.write("\n")
                await asyncio.sleep(2)
                port_output = await asyncio.wait_for(reader.read(8000), timeout=15)
                port_count_match = re.search(r"Total:\s+(\d+)", port_output)
                port_count = int(port_count_match.group(1)) if port_count_match else 0
                board_data.append({
                    "slot": int(slot_id),
                    "board_name": board_name,
                    "status": status,
                    "online_status": online_status,
                    "port_count": port_count,
                })
        writer.close()
        reader.close()
        result = {
            "data": {
                "total_slots": len(re.findall(r"^\s*\d+", output, re.MULTILINE)),
                "installed_cards": len(board_data),
                "boards": board_data
            }
        }
        print(result)
        return result
    except Exception as e:
        log(f"Error in get_olt_metrics: {str(e)}", error=True)
        return None
    finally:
        if writer:
            writer.close()
            await asyncio.sleep(0.1)

if __name__ == "__main__":
    import asyncio
    asyncio.run(get_installed_board_info("172.20.100.30",'splynx',"Dotmac@Splynx1"))