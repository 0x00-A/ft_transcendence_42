from django.db.models.signals import post_save
from django.db.models.signals import post_delete, pre_save
from django.contrib.auth.signals import user_logged_in
from django.contrib.auth.signals import user_logged_out
import logging
import os
from django.conf import settings
from datetime import timedelta
from django.utils.timezone import now

from django.dispatch import receiver
from accounts.models import User, Achievement, UserAchievement, Notification
from accounts.utils import translate_text
from matchmaker.models import Game
from .models import Profile
from .models import Badge

from accounts.consumers import NotificationConsumer


@receiver(pre_save, sender=Profile)
def log_profile_changes(sender, instance, **kwargs):
    if instance.pk:
        old_profile = Profile.objects.get(pk=instance.pk)
        if old_profile.level + 1 == instance.level:
            target_language = instance.user.profile.preferred_language or 'en'
            try:
                translated_message = translate_text(
                    f"You have reached level {instance.level}", target_language)
                translated_title = translate_text('Level Up', target_language)
            except Exception as e:
                translated_message = f"You have reached level {instance.level}"
                translated_title = "Level Up"
            notification = Notification.objects.create(user=instance.user, title=translated_title, message=translated_message)
            notification.save()
            NotificationConsumer.send_notification_to_user(instance.user.id, notification)


@receiver(post_save, sender=UserAchievement)
def achievement_unlocked(sender, instance, **kwargs):

    if instance.is_unlocked:
        target_language = instance.user.profile.preferred_language or 'en'
        try:
            translated_message = translate_text(
                f"Achievement {instance.achievement.name} unlocked", target_language)
            translated_title = translate_text(
                'Achievement unlocked', target_language)
        except Exception as e:
            translated_message = f"Achievement {instance.achievement.name} unlocked"
            translated_title = "Achievement unlocked"
        notification = Notification.objects.create(
            user=instance.user, title=translated_title, message=translated_message)
        notification.save()
        NotificationConsumer.send_notification_to_user(
            instance.user.id, notification)


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance,
                               rank=Profile.objects.count() + 1,
                               badge=Badge.objects.get(name='Bronze'),
                               stats={'wins': 0, 'losses': 0, 'games_played': 0, 'highest_score': 0,
                                      'best_rank': Profile.objects.count() + 1, 'win_track': 0, 'win_streak': 0}
                               )
        achievements = Achievement.objects.all()
        for achievement in achievements:
            user_achievement, created = UserAchievement.objects.get_or_create(
                user=instance, achievement=achievement)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(post_delete, sender=Profile)
def delete_user_with_profile(sender, instance, **kwargs):
    if instance.user:
        instance.user.delete()
    if instance.avatar and instance.avatar != f'avatars/{settings.DEFAULT_AVATAR}':
        if os.path.isfile(instance.avatar.path):
            os.remove(instance.avatar.path)

# @receiver(pre_save, sender=Profile)
# def delete_old_avatar(sender, instance, **kwargs):
#     if instance.pk:
#         try:
#             old_profile = Profile.objects.get(pk=instance.pk)
#             if old_profile.avatar:
#                 # if os.path.isfile(old_profile.avatar.path):
#                 #     os.remove(old_profile.avatar.path)
#         except Profile.DoesNotExist:
#             pass

# @receiver(post_save, sender=User)
# def create_profile_badge(sender, instance, created, **kwargs):
#     if created:
#         badge = Badge.objects.get(name='Bronze')
#         instance.profile.badge = badge
#         instance.profile.save()


# @receiver(post_save, sender=Game)
# def check_achievements_on_game_win(sender, instance, **kwargs):
#     if instance.winner:
#         user = instance.winner
#         achievements = Achievement.objects.filter(
#             condition__contains={"games_won": 1})
#         for achievement in achievements:
#             user_achievement, created = UserAchievement.objects.get_or_create(
#                 user=user, achievement=achievement)
#             if not user_achievement.is_unlocked:
#                 progress = user_achievement.progress.get("games_won", 0) + 1
#                 user_achievement.progress["games_won"] = progress
#                 if progress >= achievement.condition["games_won"]:
#                     user_achievement.is_unlocked = True
#                     # Send n

@receiver(post_save, sender=Game)
def unlock_achievements_on_game(sender, instance, **kwargs):
    if not instance.winner:
        return
    user = instance.winner
    achievements = Achievement.objects.filter(condition__has_key="games_won")

    for achievement in achievements:
        # Check if the achievement is already unlocked
        user_achievement, created = UserAchievement.objects.get_or_create(
            user=user, achievement=achievement)

        if not user_achievement.is_unlocked:
            # Update progress
            user_achievement.progress["games_won"] = user_achievement.progress.get(
                "games_won", 0) + 1
            if user_achievement.progress["games_won"] >= achievement.condition["games_won"]:
                user_achievement.is_unlocked = True
                user_achievement.user.profile.score += achievement.reward_points

                # target_language = user.profile.preferred_language or 'en'
                # try:
                #     translated_message = translate_text(f"Achievement {achievement.name} unlocked" ,target_language)
                #     translated_title = translate_text('Achievement unlocked',target_language)
                # except Exception as e:
                #     translated_message = f"Achievement {achievement.name} unlocked"
                #     translated_title = "Achievement unlocked"
                # notification = Notification.objects.create(
                #     user=user, title=translated_title , message=translated_message)
                # notification.save()
                # NotificationConsumer.send_notification_to_user(
                #     user.id, notification)
            user_achievement.save()


logger = logging.getLogger('django')


# @receiver(user_logged_in)
# def log_user_login(sender, request, user, **kwargs):
#     print(
#         f"User {user.username} logged in from IP {request.META['REMOTE_ADDR']}")
#     logger.info(
#         f"User {user.username} logged in successfully from IP {request.META['REMOTE_ADDR']}")


# @receiver(user_logged_out)
# def log_user_logout(sender, request, user, **kwargs):
#     logger.info(
#         f"User {user.username} logged out successfully from IP {request.META['REMOTE_ADDR']}")


@receiver(user_logged_in)
def track_login_streak(sender, request, user, **kwargs):
    today = now().date()
    if user.last_login == today:
        return

    user.last_login = today
    user.save()

    achievement = Achievement.objects.get(condition__has_key="logins")

    user_achievement, created = UserAchievement.objects.get_or_create(
        user=user, achievement=achievement)

    if not user_achievement.is_unlocked:
        if user.last_login == today - timedelta(days=1):
            user_achievement.progress["logins"] = user_achievement.progress.get(
                "logins", 0) + 1
        else:
            user_achievement.progress["logins"] = 1
        if user_achievement.progress["logins"] >= achievement.condition["logins"]:
            user_achievement.is_unlocked = True
            user_achievement.user.profile.score += achievement.reward_points
            # target_language = user.profile.preferred_language or 'en'
            # try:
            #     translated_message = translate_text(f"Achievement {achievement.name} unlocked" ,target_language)
            #     translated_title = translate_text('Achievement unlocked',target_language)
            # except Exception as e:
            #     translated_message = f"Achievement {achievement.name} unlocked"
            #     translated_title = "Achievement unlocked"
            # notification = Notification.objects.create(
            #     user=user, title=translated_title , message=translated_message)
            # notification.save()
            # NotificationConsumer.send_notification_to_user(
            #     user.id, notification)
        user_achievement.save()