import asyncio

from flask import Flask, render_template, Response, request, jsonify
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


@app.route('/c/<string:data>')
def get_calendar(data):
    with lock_get_calendar:
        if data is not None:
            data = json.loads(encoder.utf8_base64_url_safe_decode(data))
            new_calendar = Calendar()
            for e in data:
                url = e[0]
                calendar = Calendar(requests.get(url).text)
                for event in calendar.events:
                    if any(cadena.lower() in event.name.lower() for cadena in e[1]):
                        new_calendar.events.add(event)
            tel.send_message(request.remote_addr, data)
            return Response(str(new_calendar), content_type='text/calendar')





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
            print(e)
            return jsonify({'error': 'Invalid URL'}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=80)
