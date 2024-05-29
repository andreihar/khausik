from flask import Flask, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

from main import translate

app = Flask(__name__)
CORS(app)

@app.route('/get', methods=['POST'])
def handle_translate_request():
    try:
        data = request.get_json()
        lang = data.get('lang')
        input = data.get('input')
        print(input, lang)
        if not input or not lang:
            return {"error": "Missing 'input' or 'lang' in request data"}, 400
        return translate(lang, input)
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == '__main__':
    debug_mode = False if os.getenv('PRODUCTION') else True
    app.run(debug=debug_mode)