import json
from django.utils.deprecation import MiddlewareMixin
from accounts.utils import translate_text

class TranslateResponseMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        content_type = response.headers.get('Content-Type', '').lower()
        if content_type == 'application/json':
            try:
                data = json.loads(response.content)
                if request.user.is_authenticated:
                    target_language = request.user.profile.preferred_language or 'en'
                else:
                    target_language = 'en'
                if 'message' in data:
                    data['message'] = translate_text(data['message'], target_language)
                elif 'error' in data:
                    data['error'] = translate_text(data['error'], target_language)
                response.content = json.dumps(data)
            except Exception as e:
                print(f"Translation Middleware Error: {e}")

        return response
