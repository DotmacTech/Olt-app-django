# import requests
# from datetime import datetime as time

# url = "http://localhost:8000/api/olts/13/slot/2/pon-port-details/" # Corrected URL

# # qwertyuiop[]asdfghjkl;'zxcvbnm,./\zxcvbnm,./
# headers = {
#     "content-type": "application/json",
# }
# start_time = time.now()
# print(start_time)
# import requests
# response = requests.request("GET",url=url, headers=headers)
# print(response.text)
# print(time.now() - start_time)


# #
import asyncio
import telnetlib3

async def shell(reader, writer):
    rules = [
            ('User name:', 'splynx'),
            ('User password:', 'Dotmac@Splynx1'),
            (') >', 'enable'),
            (') #', 'exit'),
            (') >', 'logout'),
            ]

    ruleiter = iter(rules)
    expect, send = next(ruleiter)
    while True:
        outp = await reader.read(1024)
        if not outp:
            break

        if expect in outp:
            writer.write(send)
            writer.write('\r\n')
            try:
                expect, send = next(ruleiter)
            except StopIteration:
                break

        # display all server output
        print(outp, flush=True)

    # EOF
    print()

async def main():
    reader, writer = await telnetlib3.open_connection('172.20.100.2', 23, shell=shell)
    await writer.protocol.waiter_closed


if __name__ == '__main__':
    asyncio.run(main())