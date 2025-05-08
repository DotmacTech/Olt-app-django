import requests
from datetime import datetime as time

url = "http://localhost:8000/api/olts/1/slot/2/pon-port-details/" # Corrected URL

# qwertyuiop[]asdfghjkl;'zxcvbnm,./\zxcvbnm,./
headers = {
    "content-type": "application/json",
}
start_time = time.now()
print(start_time)
import requests
response = requests.request("GET",url=url, headers=headers)
print(response.text)
print(time.now() - start_time)


#
