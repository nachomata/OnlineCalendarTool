import asyncio
import telegram
from decouple import config


TELEGRAM_TOKEN = config('TELEGRAM_TOKEN')
TELEGRAM_CHAT_ID = config('TELEGRAM_CHAT_ID')


async def send_telegram_message(message):
    bot = telegram.Bot(token=TELEGRAM_TOKEN)
    await bot.send_message(chat_id=TELEGRAM_CHAT_ID, text=message, parse_mode="Markdown")


def send_message(remote_addr, data):
    message = f"Nueva petición desde:\n"
    ips = remote_addr.split(', ')
    for ip in ips:
        message += f"    - [{ip}](https://tools.keycdn.com/geo?host={ip})\n"

    message += "con los datos: \n"
    if len(data[0]) == 1:
        message += f"    - Nombre: {data.pop(0)}"
    for e in data:
        url = e[0]
        message += f"\n    - URL: {url} con las asignaturas:\n"
        for cadena in e[1]:
            message += f"        · {cadena}\n"
    message += f"Total {len(data)} enlaces"
    asyncio.run(send_telegram_message(message))
