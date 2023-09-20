import asyncio

from flask import Flask, render_template, Response, request, jsonify
from ics.grammar.parse import ContentLine
from werkzeug.middleware.proxy_fix import ProxyFix

import encoder
import requests
import json
from ics import Calendar
import threading
import tel

app = Flask(__name__)
lock_get_calendar = threading.Lock()
lock_get_event = threading.Lock()

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_host=1)


@app.route('/')
def home():
    return render_template('gui.html')


@app.route('/c/<string:raw_data>')
def get_calendar(raw_data):
    with lock_get_calendar:
        try:
            if raw_data is not None:
                data = json.loads(encoder.utf8_base64_url_safe_decode(raw_data))
                new_calendar = Calendar()
                new_calendar.creator = "Nacho Mata | nachomata.es"
                for element in data:
                    if len(element) == 1:
                        new_calendar.extra.append(ContentLine(name="X-WR-CALNAME", value=element[0]))
                        new_calendar.extra.append(ContentLine(name="SUMMARY", value=element[0]))
                    else:
                        url = element[0]
                        calendar = Calendar(requests.get(url).text)
                        for event in calendar.events:
                            if any(cadena.lower() in event.name.lower() for cadena in element[1]):
                                new_calendar.events.add(event)
                ip_cliente = request.headers.get('X-Forwarded-For', request.remote_addr)
                tel.send_message(ip_cliente, data)
                return Response(new_calendar.serialize(), content_type='text/calendar')
        except TypeError as element:
            message = f"Nueva petición desde:\n"
            ips = request.headers.get('X-Forwarded-For', request.remote_addr).split(', ')
            for ip in ips:
                message += f"    - [{ip}](https://tools.keycdn.com/geo?host={ip})\n"

            message += f"con los datos: \n{raw_data}\n\nError: {element}"
            asyncio.run(tel.send_telegram_message(message))


@app.route('/getEvents', methods=['POST'])
def get_event():
    with lock_get_event:
        try:
            data = request.get_json()
        except Exception:
            return jsonify({'error': 'JSON not specified'}), 400
        if data is None or 'url' not in data:
            return jsonify({'error': 'URL not specified'}), 400

        try:
            calendar_txt = requests.get(data['url']).text
            calendar = Calendar(calendar_txt)
            events = []
            for event in calendar.events:
                if event.name not in events:
                    events.append(event.name)

            return jsonify(events), 200
        except Exception as e:
            return jsonify({'error': 'Invalid URL'}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
    # app.run(debug=True, host='::', port=5000)
