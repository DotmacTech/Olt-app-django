import subprocess
import platform
import shlex

def ping_host(host_ip, packets=1, timeout_ms=1000):
    """
        Pings a host to check reachability.

        Args:
            host_ip (str): The IP address or hostname to ping.
            packets (int): Number of ICMP packets to send.
            timeout_ms (int): Timeout in milliseconds for the ping command (overall or per packet depending on OS).

        Returns:
            bool: True if the host is reachable, False otherwise.
    """
    system = platform.system().lower()
    
    if system == 'windows':
        # For Windows, -n is count, -w is timeout in milliseconds for each reply
        command = f"ping -n {packets} -w {timeout_ms} {host_ip}"
    else:
        # For Linux/macOS, -c is count.
        # -W is timeout in seconds for a reply (for Linux ping)
        # -t is timeout in seconds for the entire operation (for macOS ping)
        # We'll use -W for Linux, and assume a similar behavior or default for others.
        # For simplicity, we'll convert timeout_ms to seconds for -W.
        timeout_sec = max(1, timeout_ms // 1000) # Ensure at least 1 second
        command = f"ping -c {packets} -W {timeout_sec} {host_ip}"

    try:
        # Execute the command
        # Using shell=True allows the OS to find the 'ping' command in the PATH.
        # This is acceptable here as the command structure is fixed and host_ip comes from the database.
        # When shell=True, the command should be a single string.
        process = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=(packets * (timeout_ms / 1000)) + 5
        )
        print(f"[PING_HOST_DEBUG] IP: {host_ip}, Command: '{command}', RC: {process.returncode}, STDOUT: '{process.stdout.strip()}', STDERR: '{process.stderr.strip()}'")
        return process.returncode == 0
    except subprocess.TimeoutExpired:
        print(f"[PING_HOST_DEBUG] IP: {host_ip}, Command: '{command}' - Subprocess TIMEOUT")
        return False
    except Exception as e:
        print(f"[PING_HOST_DEBUG] IP: {host_ip}, Command: '{command}' - Exception: {e}")
        return False