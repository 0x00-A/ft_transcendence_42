from django.db import models
from accounts.models import User


class Notification(models.Model):
    user = models.ForeignKey(
        User, related_name='notifications', on_delete=models.CASCADE)
    title = models.TextField()
    link = models.TextField(default='#')
    state = models.TextField(default='')
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    # type = models.CharField(
    #     max_length=50, default="general")
    # link = models.URLField(null=True, blank=True)

    def to_dict(self):
        return {
            "title": self.title,
            "link": self.link,
            "state": self.state,
            "message": self.message,
            "created_at": self.created_at.isoformat(),
            "user": self.user.username,
        }

    def __str__(self):
        return f"Notification for {self.user.username}"
