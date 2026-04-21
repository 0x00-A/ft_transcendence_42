from googletrans import Translator
import requests
from django.conf import settings


def translate_back_up(text, target_language):
    api_key = settings.API_KEY
    url = "https://api-free.deepl.com/v2/translate"
    params = {
        "auth_key": api_key,
        "text": text,
        "target_lang": target_language.upper()
    }
    try:
        response = requests.post(url, data=params)
        if response.status_code == 200:
            return response.json()["translations"][0]["text"]
        else:
            print(
                f"Translation API error: {response.status_code}, {response.text}")
            return text
    except Exception as e:
        print(f"Exception during translation (backup): {str(e)}")
        return text


def translate_text(text, target_language):
    translator = Translator()
    try:
        if not text:
            raise ValueError("Invalid input: Text is empty.")
        if isinstance(text, list):
            text = " ".join(text)
        translated = translator.translate(text, dest=target_language)
        if not translated or not translated.text:
            raise ValueError("Translation result is empty or None.")

        return translated.text
    except Exception as e:
        print(f"Primary translation failed: {str(e)}")
        # Fallback to the backup translator
        return translate_back_up(text, target_language)
