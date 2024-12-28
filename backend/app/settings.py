"""
Django settings for app project.

Generated by 'django-admin startproject' using Django 3.2.25.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

import socket
from pathlib import Path
import os
from datetime import timedelta
# from dotenv import load_dotenv


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# env = environ.Env(
#     DEBUG=(bool, False)
# )

# EMAIL SETTINGS
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = os.environ.get('EMAIL_PORT', 587)
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', True)
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')

DEFAULT_AVATAR = 'DEFAULT.jpeg'

API_KEY = os.environ.get("API_KEY")
# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get(
    'SECRET_KEY', '#*^%y+-sq+u_yvl&^$oq=6owq-=$o2ba#f*6q(711yzx^1vm1=')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = bool(int(os.environ.get('DEBUG', 1)))

# if DEBUG:
#     SERVER_URL = f"http://{os.environ.get('DOMAIN_NAME')}:{os.environ.get('PORT')}"
# else:
SERVER_URL = os.environ.get('SERVER_URL')

ALLOWED_HOSTS = []
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost').split(',')


# Application definition

INSTALLED_APPS = [
    'accounts.apps.AccountsConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 'debug_toolbar',
    'core',
    'relationships',
    'rest_framework',
    'rest_framework.authtoken',
    'drf_spectacular',
    'corsheaders',
    'rest_framework_simplejwt',
    'channels',
    'game',
    'matchmaker.apps.MatchmakerConfig',
    'chat',
]

if DEBUG:
    INSTALLED_APPS.insert(0, "daphne")

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'accounts.middleware.RefreshTokenMiddleware',
    'middleware.translate_middleware.TranslateResponseMiddleware',
]

SESSION_ENGINE = 'django.contrib.sessions.backends.db'
SESSION_COOKIE_NAME = 'sessionid'
SESSION_COOKIE_HTTPONLY = True
SESSION_SAVE_EVERY_REQUEST = True

ROOT_URLCONF = 'app.urls'

hostname = socket.gethostname()


# INTERNAL_IPS = [
#     "127.0.0.1",
#     '172.17.0.1',
#     "172.28.0.3",
#     '192.168.160.1',
#     '192.168.176.1',
#     socket.gethostbyname(hostname),
# ]

# DEBUG_TOOLBAR_CONFIG = {
#     "SHOW_TOOLBAR_CALLBACK": lambda request: DEBUG,
# }

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.wsgi.application'

# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': "django.db.backends.postgresql",
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASS'),
        'HOST': os.environ.get('DB_HOST'),
        # 'PORT': '5432',
    }
}
# DATABASES = {
#     'default': {
#         'ENGINE': "django.db.backends.postgresql",
#         'NAME': 'postgres',
#         'USER': 'postgres',
#         'PASSWORD': 'mahdi',
#         'HOST': 'localhost',
#         # 'PORT': '5432',
#     }
# }


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'handlers': {
#         'console': {
#             'level': 'DEBUG',
#             'class': 'logging.StreamHandler',
#         },
#         'file': {
#             'level': 'DEBUG',
#             'class': 'logging.FileHandler',
#             'filename': 'sql_queries.log',
#         },
#     },
#     'loggers': {
#         'django.db.backends': {
#             'handlers': ['console', 'file'],
#             'level': 'DEBUG',
#         },
#     },
# }


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproje
# STATIC_ROOT = '/web/static'ct.com/en/3.2/howto/static-files/


STATIC_URL = '/static/'
MEDIA_URL = '/media/'

STATIC_ROOT = BASE_DIR / 'static/static/'
MEDIA_ROOT = BASE_DIR / 'static/media/'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# AUTH_USER_MODEL = 'core.User'

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',

    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'accounts.authenticate.CookieJWTAuthentication',
    ]
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    # 'ACCESS_TOKEN_LIFETIME': timedelta(seconds=5),
    # 'REFRESH_TOKEN_LIFETIME': timedelta(seconds=20),
    # 'SLIDING_TOKEN_LIFETIME': timedelta(days=30),
    # 'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
    # 'ROTATE_REFRESH_TOKENS': True,
    # 'SLIDING_TOKEN_REFRESH_LIFETIME_LATE_USER': timedelta(days=1),
    # 'SLIDING_TOKEN_LIFETIME_LATE_USER': timedelta(days=30),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

AUTH_USER_MODEL = 'accounts.User'

AUTHENTICATION_BACKENDS = [
    # 'accounts.oauth2AuthBackend.Oauth2AuthBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# Daphne
ASGI_APPLICATION = "app.asgi.application"

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            # Use environment variables for Redis host and port
            'hosts': [
                (os.environ.get('REDIS_HOST', 'redis'),
                 int(os.environ.get('REDIS_PORT', 6379)))
            ],
        },
    },
}
# Allow specific origins
CORS_ALLOWED_ORIGINS = [
    # 'http://0.0.0.0:3000',
    'http://localhost:3000',
    'https://e1r9p14',
]

CORS_ALLOW_METHODS = [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
]

CORS_ALLOW_HEADERS = [
    'content-type',
    'authorization',
]

CORS_ALLOW_ALL_ORIGINS = True

# CORS_ALLOWED_ORIGINS = [
#     "http://localhost:3000",
#     'http://0.0.0.0:3000',
# ]
CORS_ALLOW_CREDENTIALS = True

CSRF_TRUSTED_ORIGINS = ['https://ft-pong.me',
                        'https://wwww.ft-pong.me',
                        'https://127.0.0.1',
                        'https://localhost',
                        'http://localhost:3000'
                        'http://0.0.0.0:3000',
                        # 'wss://yourdomain.com'
                        ]

# LOG_DIR = '/app/backend/logs'
# os.makedirs(LOG_DIR, exist_ok=True)

# LOGGING = {
#     'version': 1,
#     'disable_existing_loggers': False,
#     'formatters': {
#         'verbose': {
#             'format': '{levelname} {asctime} {module} {message}',
#             'style': '{',
#         },
#         'simple': {
#             'format': '{levelname} {message}',
#             'style': '{',
#         },
#     },
#     'handlers': {
#         # 'file': {
#         #     'level': 'DEBUG',
#         #     'class': 'logging.FileHandler',
#         #     'filename': os.path.join(LOG_DIR, 'django_logs.log'),
#         #     'formatter': 'verbose',
#         # },
#         'file': {
#             'level': 'INFO',
#             'class': 'logging.handlers.RotatingFileHandler',
#             'filename': os.path.join(LOG_DIR, 'app.log'),
#             'maxBytes': 1024 * 1024 * 1,  # 10 MB
#             'backupCount': 5,
#             'formatter': 'verbose',
#         },
#         # 'error_file': {
#         #     'level': 'ERROR',
#         #     'class': 'logging.FileHandler',
#         #     # 'filename': '/var/log/django/error.log',
#         #     'filename': os.path.join(LOG_DIR, 'error.log'),
#         #     'formatter': 'verbose',
#         # },
#         # 'console': {
#         #     'level': 'ERROR',  # Change from DEBUG to ERROR
#         #     'class': 'logging.StreamHandler',
#         # },
#     },
#     'loggers': {
#         # '': {  # Root logger configuration
#         #     'level': 'DEBUG',
#         #     # Log messages will be written to the 'file' handler
#         #     'handlers': ['file'],
#         # },
#         # 'django.request': {
#         #     'handlers': ['error_file'],
#         #     'level': 'DEBUG',
#         #     'propagate': True,
#         # },
#         'django': {
#             'handlers': ['file'],
#             'level': 'DEBUG',
#             'propagate': True,
#         },
#         # 'django.security': {
#         #     'handlers': ['file'],
#         #     'level': 'INFO',  # You can adjust the level to capture specific events
#         #     'propagate': False,
#         # },
#         # 'daphne': {
#         #     'handlers': ['file'],
#         #     'level': 'DEBUG',
#         #     'propagate': True,
#         # },
#         # 'django.db.backends': {
#         #     'level': 'INFO',
#         #     'handlers': ['file'],
#         #     'propagate': True,
#         # },
#         # 'django.channels': {
#         #     'handlers': ['console'],
#         #     'level': 'ERROR',  # Adjust this to reduce verbosity
#         #     'propagate': True,
#         # },
#     },
# }


# # LOGGING = {
# #     'version': 1,
# #     'disable_existing_loggers': False,
# #     'handlers': {
# #         'logstash': {
# #             'level': 'INFO',
# #             'class': 'logstash.TCPLogstashHandler',
# #             'host': 'logstash',
# #             'port': 5959,  # Default value: 5959
# #             'version': 1,
# #             'message_type': 'django',
# #             'fqdn': False,
# #             'tags': ['django.request'],
# #         },
# #         'console': {
# #             'level': 'INFO',
# #             'class': 'logging.StreamHandler'
# #         },
# #     },
# #     'loggers': {
# #         'django.request': {
# #             'handlers': ['logstash'],
# #             'level': 'DEBUG',
# #             'propagate': True,
# #         },

# #         'django': {
# #             'handlers': ['console'],
# #             'propogate': True,
# #         },
# #     }
# # }
