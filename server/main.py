import requests
from deep_translator import GoogleTranslator
import opencc

converter = opencc.OpenCC('s2t.json')
session = requests.Session()

def translate(lang, input):
    if lang == 'zh-TW':
        return get_taiwanese(input)
    else:
        return get_taiwanese(GoogleTranslator(source=lang, target='zh-TW').translate(input))

def get_taiwanese(input):
    url = f"http://tts001.iptcloud.net:8804/display2taibun?text0={input}"
    return session.get(url).text