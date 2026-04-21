from django.db import models

class Badge(models.Model):
    NAME_CHOICES = [
        ('Bronze', 'Bronze'),
        ('Silver', 'Silver'),
        ('Gold', 'Gold'),
        ('Platinum', 'Platinum'),
        ('Diamond', 'Diamond'),
        ('Ft-Pong', 'Ft-Pong'),
    ]

    name = models.CharField(max_length=10, choices=NAME_CHOICES)
    icon = models.ImageField(upload_to='badges/', default='badges/bronze.png')
    level_required = models.PositiveSmallIntegerField()
    xp_reward = models.PositiveSmallIntegerField(default=0)

    @classmethod
    def get_badge(cls, level):
        if level < 5:
            return cls.objects.get(name='Bronze')
        elif level < 10:
            return cls.objects.get(name='Silver')
        elif level < 15:
            return cls.objects.get(name='Gold')
        elif level < 20:
            return cls.objects.get(name='Platinum')
        elif level < 25:
            return cls.objects.get(name='Diamond')
        elif level >= 30:
            return cls.objects.get(name='Ft-Pong')

    def __str__(self):
        return self.name