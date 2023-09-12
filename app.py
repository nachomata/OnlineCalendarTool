from flask import Flask, render_template, Response
import encoder
import requests
import json
from ics import Calendar


app = Flask(__name__)


@app.route('/')
def hello_world():
    return render_template('gui.html')


@app.route('/c/<string:data>')
def get_calendar(data):
    if data is not None:
        data = json.loads(encoder.utf8_base64_url_safe_decode(data))
        calendar = Calendar(requests.get(data['url']).text)
        new_calendar = Calendar()
        for event in calendar.events:
            if data['subject'].lower() not in event.name.lower():
                new_calendar.events.add(event)

        return Response(str(new_calendar), content_type='text/calendar')


#app.run(debug=True, host='0.0.0.0', port=80)
