from django.contrib import admin

from relationships.models import FriendRequest, BlockRelationship

admin.site.register(FriendRequest)
admin.site.register(BlockRelationship)
