from django.contrib import admin

from accounts.models import User, EmailVerification ,Profile, Badge, PasswordReset
from accounts.models import Achievement
from accounts.models import UserAchievement
from accounts.models import Notification


admin.site.register(User)
admin.site.register(EmailVerification)
admin.site.register(Profile)

admin.site.register(Badge)
admin.site.register(UserAchievement)

admin.site.register(Notification)

admin.site.register(PasswordReset)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'condition', 'reward_points')
