from django.apps import AppConfig


class MatchmakerConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'matchmaker'

    def ready(self):
        import matchmaker.signals
