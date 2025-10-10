import asyncio
import telnetlib3
import re
import sys
from datetime import datetime

def log(message, error=False):
    timestamp = datetime.now().strftime('%H:%M:%S')
    prefix = '[ERROR]' if error else '[INFO] '
    print(f"[{timestamp}]{prefix} {message}", file=sys.stderr if error else sys.stdout)

async def send_command(writer, reader, command, wait_time=2):
    """Send a command and return the output."""
    try:
        log(f"Sending command: {command}")
        writer.write(f"{command}\r\n")
        await asyncio.sleep(wait_time)
        output = await asyncio.wait_for(reader.read(4096), timeout=15)
        log(f"Received {len(output)} bytes in response")
        return output
    except asyncio.TimeoutError:
        log(f"Timeout waiting for response to command: {command}", error=True)
        return ""
    except Exception as e:
        log(f"Command '{command}' failed: {str(e)}", error=True)
        return ""

async def get_olt_metrics(host, username, password, board=0):
    reader = writer = None
    try:
        log(f"Connecting to {host}...")
        reader, writer = await telnetlib3.open_connection(host, 23, encoding='ascii')
        log("Connection established")
        
        # Initial read to get login prompt
        output = await reader.read(1024)
        log(f"Initial output: {output[:100]}...")
        
        # Login sequence
        if "User name:" in output or "login:" in output.lower():
            log("Sending username...")
            writer.write(f"{username}\n")
            await asyncio.sleep(1)
            output = await asyncio.wait_for(reader.read(1024), timeout=10)
            log(f"After username: {output[:200]}...")
            
        if "User password:" in output:
            log("Sending password...")
            writer.write(f"{password}\n")
            await asyncio.sleep(1)
            output = await asyncio.wait_for(reader.read(1024), timeout=10)
            log(f"After password: {output[:200]}...")
        
        # Enter enable mode if needed
        if ">" in output and "#" not in output:
            log("Entering enable mode...")
            writer.write("enable\n")
            await asyncio.sleep(1)
            output = await asyncio.wait_for(reader.read(1024), timeout=10)
            
            if "User password:" in output:
                writer.write(f"{password}\r\n")
                await asyncio.sleep(1)
                output = await asyncio.wait_for(reader.read(1024), timeout=10)
        
        # Get uptime
        log("\n=== Getting uptime ===")
        writer.write("display sysuptime\n")
        await asyncio.sleep(2)
        writer.write("\n")
        await asyncio.sleep(2)
        output = await asyncio.wait_for(reader.read(4096), timeout=15)
        log(f"Uptime output: {output[:200]}...")
        
        # Try different patterns to match the uptime
        match = re.search(r'System up time:\s*(\d+)\s*day\s*(\d+)\s*hour', output)
        if not match:
            match = re.search(r'uptime is\s*(\d+)\s*days?\s*(\d+)\s*hours?', output, re.IGNORECASE)
        uptime = f"{match.group(1)}d {match.group(2)}h" if match else "Unknown"
        log(f"Parsed uptime: {uptime}")
        writer.write("\n")
        await asyncio.sleep(2)

        # Get board info
        log("\n=== Getting board information ===")
        writer.write(f"display board desc {board}\n")
        await asyncio.sleep(2)
        writer.write("\n")
        await asyncio.sleep(2)
        output = await asyncio.wait_for(reader.read(4096), timeout=15)
        log(f"Board info output: {output[:200]}...")
        
        # Parse board information
        board_lines = re.findall(r'\d+/\s*\d+\s+(\S+)', output)
        if not board_lines:
            board_lines = re.findall(r'Slot\s+Port\s+Board Type', output)
        total_cards = len([desc for desc in board_lines if desc.strip()])
        log(f"Found {total_cards} board entries")

        cpus = []
        memories = []
        temperatures = []
        slots = []

        for card in range(total_cards+1):
            log(f"Board: {card}")
            
            slots.append(card)

            # Get CPU usage
            log("\n=== Getting CPU usage ===")
            writer.write(f"display cpu {board}/{card}\n")
            await asyncio.sleep(2)
            writer.write("\n")
            await asyncio.sleep(2)
            output = await asyncio.wait_for(reader.read(4096), timeout=15)
            log(f"CPU output: {output[:200]}...")
            
            match = re.search(r'CPU occupancy:\s*(\d+)%', output)
            cpu = int(match.group(1)) if match else None
            log(f"CPU Usage: {cpu}%")
            cpus.append(cpu)
            
            # Get memory usage
            log("\n=== Getting memory usage ===")
            writer.write(f"display mem {board}/{card}\n")
            await asyncio.sleep(2)
            writer.write("\n")
            await asyncio.sleep(2)
            output = await asyncio.wait_for(reader.read(4096), timeout=15)
            log(f"Memory output: {output[:200]}...")
            mem_match = re.search(r'Memory occupancy:\s*(\d+)%', output)
            memory = int(mem_match.group(1)) if mem_match else 0
            log(f"Memory Usage: {memory}%")
            memories.append(memory)
            
            # Get temperature
            log("\n=== Getting temperature ===")
            writer.write(f"display temperature {board}/{card}\n")
            await asyncio.sleep(2)
            writer.write("\n")
            await asyncio.sleep(2)
            output = await asyncio.wait_for(reader.read(4096), timeout=15)
            log(f"Temperature output: {output[:200]}...")
            
            
            temp_match = re.search(r'temperature of the board:\s*(\d+)', output, re.IGNORECASE)
            if not temp_match:
                temp_match = re.search(r'Board Temperature\s*:\s*(\d+)', output, re.IGNORECASE)
            temperature = int(temp_match.group(1)) if temp_match else 0
            log(f"Board Temperature: {temperature}°C")
            temperatures.append(temperature)
        import statistics
        cpus_not_none= []
        memories_not_none = []
        temperatures_not_none = []
        for i in range(total_cards):
            
            if cpus[i] is not None and cpus[i] != 0:
                cpus_not_none.append(cpus[i])
            if memories[i] is not None and memories[i] != 0:
                memories_not_none.append(memories[i])
            if temperatures[i] is not None and temperatures[i] != 0:
                temperatures_not_none.append(temperatures[i])
        
        return {
            'uptime': uptime,
            # 'slots': slots,
            # 'cpus': cpus,
            # 'memories': memories,
            # 'temperatures': temperatures,
            'cpu': statistics.mean(cpus_not_none),
            'memory': statistics.mean(memories_not_none),
            'temperature': statistics.mean(temperatures_not_none),
            'total_cards': total_cards
        }
            
    except Exception as e:
        log(f"Error in get_olt_metrics: {str(e)}", error=True)
        return None
    finally:
        if writer:
            writer.close()
            await asyncio.sleep(0.1)

def main():
    host = "172.20.100.6"
    username = "splynx"
    password = "Dotmac@Splynx1"
    
    
    print(f"Connecting to {host}...")
    
    try:
        # Run the async function
        metrics = asyncio.run(get_olt_metrics(host, username, password))
        
        if metrics:
            print("\n=== OLT Metrics ===")
            for key, value in metrics.items():
                print(f"{key.capitalize()}: {value if value is not None else 'N/A'}")
        else:
            print("Failed to retrieve metrics.")
            
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    main()