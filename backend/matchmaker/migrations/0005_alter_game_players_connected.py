# Generated by Django 4.2.17 on 2024-12-30 01:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matchmaker', '0004_alter_game_players_connected'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='players_connected',
            field=models.BooleanField(default=False),
        ),
    ]
