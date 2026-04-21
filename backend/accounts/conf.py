import os


#############################
# AUTHENTICATION PARAMETERS #
#############################
"""
    the following parameter is used for the email verification link sent to the user (frontend)
"""
CLIENT_EMAIL_VERIFICATION_URL = os.getenv("CLIENT_EMAIL_VERIFICATION_URL", "https://localhost/auth/verify-email")
CLIENT_EMAIL_UPDATE_URL = os.getenv("CLIENT_EMAIL_UPDATE_URL", "https://localhost/profile/update-email")
CLIENT_RESET_PASSWORD_URL = os.getenv("CLIENT_RESET_PASSWORD_URL", "https://localhost/auth/reset-password")
CLIENT_URL = os.getenv("CLIENT_URL", "http://localhost:3000/")

OAUTH2_REDIRECT_URI = os.getenv('OAUTH2_REDIRECT_URI')

###############
# DISCORD ENV #
###############
DISCORD_TOKEN_URL = os.getenv('DISCORD_TOKEN_URL')
DISCORD_CLIENT_ID = os.getenv('DISCORD_CLIENT_ID')
DISCORD_AUTHORIZATION_URL = os.getenv('DISCORD_AUTHORIZATION_URL') + f"?client_id={DISCORD_CLIENT_ID}&redirect_uri={OAUTH2_REDIRECT_URI}discord/&response_type=code&scope=identify%20email"
DISCORD_CLIENT_SECRET = os.getenv('DISCORD_CLIENT_SECRET')
DISCORD_USER_URL = os.getenv('DISCORD_USER_URL')
###############
#  INTRA ENV  #
###############
INTRA_CLIENT_ID = os.getenv('INTRA_CLIENT_ID')
INTRA_CLIENT_SECRET = os.getenv('INTRA_CLIENT_SECRET')
INTRA_AUTHORIZATION_URL = os.getenv('INTRA_AUTHORIZATION_URL') + f"?client_id={INTRA_CLIENT_ID}&redirect_uri={OAUTH2_REDIRECT_URI}intra/&response_type=code"
INTRA_TOKEN_URL = os.getenv('INTRA_TOKEN_URL')
INTRA_USER_URL = os.getenv('INTRA_USER_URL')
################
#  GOOGLE ENV  #
################
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_AUTHORIZATION_URL = os.getenv('GOOGLE_AUTHORIZATION_URL') + f"?client_id={GOOGLE_CLIENT_ID}&redirect_uri={OAUTH2_REDIRECT_URI}google/&response_type=code&scope=email+profile"
GOOGLE_TOKEN_URL = os.getenv('GOOGLE_TOKEN_URL')
GOOGLE_USER_URL = os.getenv('GOOGLE_USER_URL')

################
CLIENT_URL = os.getenv('CLIENT_URL')

API_CLIENT_OAUTH2_REDIRECT_URL = os.getenv('API_CLIENT_OAUTH2_REDIRECT_URL')


SERVER_URL = os.getenv('SERVER_URL', 'http://localhost:8000')
LOGO_PATH = 'static/media/ft_pong.png'
# LOGO_PATH = "http://localhost:8000/media/logo.svg"