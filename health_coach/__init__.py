try:
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except Exception:
    pass

VERSION = '0.0.11'

