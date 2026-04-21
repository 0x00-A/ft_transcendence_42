from django.utils.deprecation import MiddlewareMixin


class RefreshTokenMiddleware(MiddlewareMixin):

    def process_response(self, request, response):
        # print('++++++++++request+++++++++++++++')
        # print("request: ", request.headers)
        if 'new_access_token' in request.session:
            new_access_token = request.session.get('new_access_token')
            del request.session['new_access_token']
            request.session.save()
            response.set_cookie(
                'access_token',
                new_access_token,
                httponly=True,
                secure=True,
                samesite='Lax'
            )
        return response
