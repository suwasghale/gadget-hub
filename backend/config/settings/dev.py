"""
Local development settings.

Usage:
    python manage.py runserver   (manage.py defaults to config.settings.dev)

Never used in staging or production.
"""

from .base import *  # noqa: F401, F403

DEBUG = env.bool("DEBUG", default=True)  # noqa: F405

# Local-only fallback so a fresh checkout runs without a .env SECRET_KEY.
SECRET_KEY = SECRET_KEY or "django-insecure-local-development-only"  # noqa: F405

ALLOWED_HOSTS = env.list(  # noqa: F405
    "ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "[::1]"],
)

# ------------------------------------------------------------------------------
# Django Debug Toolbar
# ------------------------------------------------------------------------------

INSTALLED_APPS += ["debug_toolbar"]  # noqa: F405

# Right after CorsMiddleware, where it was before the settings split.
_cors_index = MIDDLEWARE.index("corsheaders.middleware.CorsMiddleware")  # noqa: F405
MIDDLEWARE.insert(  # noqa: F405
    _cors_index + 1, "debug_toolbar.middleware.DebugToolbarMiddleware"
)
