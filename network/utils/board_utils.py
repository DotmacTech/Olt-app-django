import paramiko
import re
import time

def get_installed_board_info(host, username, password, frame='0'):
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(hostname=host, username=username, password=password)
    channel = ssh.invoke_shell()
    time.sleep(1)
    channel.recv(9999)
    channel.send("enable\n")
    channel.recv(9999)
    channel.send("config\n")
    channel.recv(9999)
    channel.send(f"display board {frame}\n")
    time.sleep(2)
    channel.send("\n")
    time.sleep(2)
    output = channel.recv(8000).decode("utf-8")
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
            channel.send(f"display port desc {frame}/{slot_id}\n")
            time.sleep(2)
            channel.send("\n")
            time.sleep(2)
            port_output = channel.recv(8000).decode("utf-8")
            port_count_match = re.search(r"Total:\s+(\d+)", port_output)
            port_count = int(port_count_match.group(1)) if port_count_match else 0
            board_data.append({
                "slot": int(slot_id),
                "board_name": board_name,
                "status": status,
                "online_status": online_status,
                "port_count": port_count,
            })
    channel.close()
    ssh.close()
    result = {
        "data": {
            "total_slots": len(re.findall(r"^\s*\d+", output, re.MULTILINE)),
            "installed_cards": len(board_data),
            "boards": board_data
        }
    }
    print(result)
    return result
# if __name__ == "__main__":
#     get_installed_board_info("172.20.100.14",'dotmac',"Dotmac@1")