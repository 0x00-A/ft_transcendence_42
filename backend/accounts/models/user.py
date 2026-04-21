from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
import uuid

# class ActiveUsersManager(BaseUserManager):
#     def get_queryset(self) -> models.QuerySet:
#         return super().get_queryset().filter(is_active=True)

class User(AbstractUser):
    email = models.EmailField(unique=True, null=False, blank=False)
    is_password_set = models.BooleanField(default=True)
    is_oauth2_user = models.BooleanField(default=False)
    oauth2_id = models.CharField(max_length=50, blank=True, null=True)
    oauth2_provider = models.CharField(max_length=50, blank=True, null=True)
    friends = models.ManyToManyField('self', blank=True, symmetrical=True)
    is2fa_active = models.BooleanField(default=False)
    otp_secret = models.CharField(max_length=32, blank=True, null=True)
    # otp_expires = models.DateTimeField(blank=True, null=True)
    last_seen = models.CharField(max_length=50, default="Never", blank=True)
    active_conversation = models.IntegerField(default=-1)
    open_chat = models.BooleanField(default=False)

    # active = ActiveUsersManager()

    # class Meta:
    #     base_manager_name = 'active'

    def __str__(self):
        return self.username


class EmailVerification(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    new_email = models.EmailField(unique=True, null=True, blank=True)

    def __str__(self):
        return self.user.username

class PasswordReset(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username