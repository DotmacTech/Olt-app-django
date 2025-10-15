import asyncio
import re
import logging

logger = logging.getLogger(__name__)

class ONTDiscovery:
    def __init__(self, host, username, password, port=23):
        self.host = host
        self.port = port
        self.username = username
        self.password = password

    async def safe_read(self, reader, expected_pattern: bytes, timeout: float = 5):
        """Safely read from reader with timeout"""
        try:
            data = await asyncio.wait_for(reader.readuntil(expected_pattern), timeout)
            return data
        except asyncio.TimeoutError:
            logger.warning(f"Timeout waiting for: {expected_pattern.decode(errors='ignore')}")
            return b""
        except Exception as e:
            logger.error(f"Error reading from OLT: {e}")
            return b""

    async def discover_onts(self):
        """Discover unconfigured ONTs on the OLT"""
        try:
            reader, writer = await asyncio.wait_for(
                asyncio.open_connection(self.host, self.port),
                timeout=10.0
            )
            logger.info(f"Connected to OLT at {self.host}:{self.port}")

            try:
                # Login sequence
                await self.safe_read(reader, b":")
                writer.write(self.username.encode() + b"\n")
                await writer.drain()

                await self.safe_read(reader, b"password:")
                writer.write(self.password.encode() + b"\n")
                await writer.drain()

                login_output = await reader.read(2048)
                if b"invalid" in login_output.lower() or b"failed" in login_output.lower():
                    raise Exception("Login failed")

                # Enter enable and config mode
                writer.write(b"enable\n")
                await writer.drain()
                await asyncio.sleep(0.5)

                writer.write(b"config\n")
                await writer.drain()
                await asyncio.sleep(0.5)

                # Get autofind ONTs
                writer.write(b"display ont autofind all\n")
                await writer.drain()

                full_response = await self._read_paginated_output(reader, writer)
                return self._parse_ont_data(full_response.decode(errors="ignore"))

            finally:
                writer.close()
                await writer.wait_closed()

        except Exception as e:
            logger.error(f"Error discovering ONTs on {self.host}: {e}")
            return []

    async def _read_paginated_output(self, reader, writer):
        """Handle paginated output from OLT"""
        full_response = b""
        await asyncio.sleep(1)

        for _ in range(20):  # Max 20 pages
            chunk = await reader.read(8192)
            if not chunk:
                break

            full_response += chunk

            if b"---- More" in chunk or b"--More--" in chunk:
                writer.write(b" ")
                await writer.drain()
                await asyncio.sleep(0.5)
            elif b"(config)#" in chunk or b"#" in chunk[-50:]:
                break

        return full_response

    def _parse_ont_data(self, response_text):
        """Parse ONT information from response text"""
        discovered_onts = []
        
        # Extract all relevant information using regex
        ont_info = re.finditer(
            r"F/S/P\s+:\s+(\d+/\d+/\d+)\s+"
            r"Ont SN\s+:\s+([0-9A-F]+)\s+\(([A-Z0-9\-]+)\)\s+"
            r"(?:.*?VendorID\s+:\s+(\w+))?",
            response_text,
            re.DOTALL
        )

        for match in ont_info:
            position, hex_sn, readable_sn, vendor = match.groups()
            frame, slot, port = map(int, position.split('/'))
            
            ont_data = {
                'serial_number': readable_sn,
                'hex_serial_number': hex_sn,
                'vendor_id': vendor or self._extract_vendor_id(hex_sn),
                'frame': frame,
                'slot': slot,
                'port': port,
                'status': 'discovered'
            }
            discovered_onts.append(ont_data)

        return discovered_onts

    def _extract_vendor_id(self, hex_sn):
        """Extract vendor ID from hex serial number"""
        try:
            vendor_hex = hex_sn[:8]
            vendor_ascii = bytes.fromhex(vendor_hex).decode('ascii')
            return ''.join(c for c in vendor_ascii if c.isalnum())
        except:
            return 'UNKNOWN'

# Example usage:
async def discover_onts_on_olt(host, username, password):
    discoverer = ONTDiscovery(host, username, password)
    return await discoverer.discover_onts()

if __name__ == "__main__":
    # Example usage with async
    import sys
    if len(sys.argv) != 4:
        print("Usage: python discover_onts.py <host> <username> <password>")
        sys.exit(1)
    
    host, username, password = sys.argv[1:]
    results = asyncio.run(discover_onts_on_olt(host, username, password))
    for ont in results:
        print(f"Found ONT: {ont}")
        