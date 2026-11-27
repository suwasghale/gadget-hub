"""
Base settings for gadget-hub, shared by every environment.

Environment-specific values live in:

- config/settings/dev.py   local development (manage.py default)
- config/settings/prod.py  production (wsgi/asgi default)

Do not place environment-specific settings here.
"""

from pathlib import Path
from datetime import timedelta
import os
import environ


AUTH_USER_MODEL = 'users.User'

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Initialise environment variables
env = environ.Env(
    # Set default for DEBUG to False if it's not set in .env
    DEBUG=(bool, False)
)

# Read .env file
# It will load environment variables from the .env file
environ.Env.read_env(BASE_DIR / '.env')


# Core Django. dev.py supplies a local fallback key; prod.py requires one.
SECRET_KEY = env("SECRET_KEY", default=None)

DEBUG = False

ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=[])


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Local apps
    'apps.products',
    # 'apps.users',
    "apps.users.apps.UsersConfig",
    "apps.addresses",
    "apps.wishlist",
    "apps.cart",
    "apps.orders",
    "apps.payments",
    "apps.shipments",
    "apps.invoices",
    "apps.notifications",
    "apps.analytics",
    "apps.discounts",
    "apps.support",


    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'drf_spectacular',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'corsheaders',
    "phonenumber_field",
    "cloudinary_storage",
    "cloudinary",

]

# rest-framework
REST_FRAMEWORK = {
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.NamespaceVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": ["v1", "v2"],
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
    'PAGE_SIZE': 10,

}
REST_FRAMEWORK.update({
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "50/min",
        "user": "200/min",
        "login": "5/min",
        "register": "5/hour",
        "logout": "30/min",
        "logout_all": "10/min",
        "email_verify": "3/min",
        "forgot_password": "3/min",
        "product_browse": "1000/day",
    },
})

# simple jwt
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "ALGORITHM": "HS256",                     # Add algorithm
    # SIGNING_KEY defaults to settings.SECRET_KEY (resolved per environment).
    # "SIGNING_KEY": env("JWT_SIGNING_KEY"), to be made later

}
# drf-spectacular
SPECTACULAR_SETTINGS = {
    'TITLE': 'GadgetHub API',
    'DESCRIPTION': 'Advanced eCommerce API built with Django REST Framework. Includes authentication, product, order, payment, and shipping management.',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,  # to avoid schema duplication in swagger-ui
    'SCHEMA_PATH_PREFIX': '/api/v1',  # optional, keeps your API docs neat

    # jwt integration
    'SECURITY': [{'BearerAuth': []}],

    # Optional but useful:
    'SERVE_PERMISSIONS': ['rest_framework.permissions.AllowAny'],
    'COMPONENT_SPLIT_REQUEST': True,   # split request/response body schemas
    'SORT_OPERATIONS': True,
    'SORT_TAGS': True,
    'POSTPROCESSING_HOOKS': [],
}


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "corsheaders.middleware.CorsMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    
]

CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
]


INTERNAL_IPS = [
    "127.0.0.1",  # or "localhost"
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }


# DB_ENGINE=mysql (default) uses the DB_* values below.
# DB_ENGINE=sqlite uses backend/db.sqlite3 and needs no database server.
DB_ENGINE = env('DB_ENGINE', default='mysql')

if DB_ENGINE == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': env('DB_NAME'),
            'USER': env('DB_USER'),
            'PASSWORD': env('DB_PASSWORD'),
            'HOST': env('DB_HOST', default='127.0.0.1'),
            'PORT': env('DB_PORT', default='3307'),
            'OPTIONS': {
                'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            },
        }
    }

# caching. Set REDIS_URL to use Redis; without it an in-process cache is used
# (fine for one local runserver, not for multiple production workers).
REDIS_URL = env('REDIS_URL', default='')

if REDIS_URL:
    CACHES = {
        "default": {
            "BACKEND": "django_redis.cache.RedisCache",
            "LOCATION": REDIS_URL,
            "OPTIONS": {
                "CLIENT_CLASS": "django_redis.client.DefaultClient",
            },
            "TIMEOUT": 300,  # default 5 minutes
        }
    }
else:
    CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "TIMEOUT": 300,
        }
    }

AUTHENTICATION_BACKENDS = [
    "apps.users.auth_backends.EmailOrUsernameBackend",
    "django.contrib.auth.backends.ModelBackend",
]


# email-smtp
EMAIL_BACKEND = env(
    'EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend'
)
EMAIL_HOST = env('EMAIL_HOST', default='localhost')
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', default='no-reply@gadgethub.local')

# Where the Next.js frontend runs. Used for links sent by email.
FRONTEND_URL = env('FRONTEND_URL', default='http://localhost:3000')

# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Media storage. With all three CLOUDINARY_* values set, uploads go to
# Cloudinary; otherwise they are saved under MEDIA_ROOT and served by Django
# in development. (DEFAULT_FILE_STORAGE was removed in Django 5.1; STORAGES
# is the setting Django actually reads.)
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': env('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': env('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': env('CLOUDINARY_API_SECRET', default=''),
}
USE_CLOUDINARY = all(CLOUDINARY_STORAGE.values())

STORAGES = {
    "default": {
        "BACKEND": (
            "cloudinary_storage.storage.MediaCloudinaryStorage"
            if USE_CLOUDINARY
            else "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Kathmandu'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ----------------Pyaments Settings ----------------
# esewa 
ESEWA_MERCHANT_ID = "EPAYTEST"  # Test merchant ID, replace in production

# khalti
# === Khalti Sandbox (use dev.khalti.com) ===
KHALTI_IS_SANDBOX = True  # True = dev sandbox, False = live
KHALTI_SECRET_KEY = env('KHALTI_SECRET_KEY', default='')  # from Khalti sandbox docs
KHALTI_RETURN_URL = "http://127.0.0.1:8000/payments/khalti/return/"
KHALTI_WEBSITE_URL = "http://127.0.0.1:8000"

# stripe
STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", default="")
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY", default="")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", default=None)


# frontend
CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=["http://localhost:5173", "http://localhost:3000"],
)

CORS_ALLOWED_CREDENTIALS = True