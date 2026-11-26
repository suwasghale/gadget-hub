"""
Production settings.

Usage:
    DJANGO_SETTINGS_MODULE=config.settings.prod   (wsgi.py / asgi.py default)

SECRET_KEY and ALLOWED_HOSTS must come from the environment.
"""

from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401, F403

DEBUG = False

if not SECRET_KEY:  # noqa: F405
    raise ImproperlyConfigured("SECRET_KEY must be set in production.")

if not ALLOWED_HOSTS:  # noqa: F405
    raise ImproperlyConfigured("ALLOWED_HOSTS must be set in production.")

# ------------------------------------------------------------------------------
# Transport security
# ------------------------------------------------------------------------------

SECURE_SSL_REDIRECT = env.bool("SECURE_SSL_REDIRECT", default=True)  # noqa: F405
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = env.int("SECURE_HSTS_SECONDS", default=31536000)  # noqa: F405
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = "DENY"

# Behind a TLS-terminating reverse proxy (nginx), trust its scheme header.
if env.bool("USE_X_FORWARDED_PROTO", default=False):  # noqa: F405
    SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

CSRF_TRUSTED_ORIGINS = env.list(  # noqa: F405
    "CSRF_TRUSTED_ORIGINS", default=CORS_ALLOWED_ORIGINS  # noqa: F405
)
