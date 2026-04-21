from django.contrib import admin
from .models import Game, Tournament, Match, MultiGame

# Register your models here.


admin.site.register(Game)
admin.site.register(MultiGame)
admin.site.register(Tournament)
admin.site.register(Match)
