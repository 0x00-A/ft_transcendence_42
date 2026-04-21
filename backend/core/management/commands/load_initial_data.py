from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = "Populate the database with initial data."

    def handle(self, *args, **options):
        # Check if data already exists to prevent duplication
        if User.objects.exists():
            self.stdout.write(self.style.WARNING(
                "Data already exists, skipping"))
            return
        # Add your data here
        User.objects.create(name="Example", other_field="Value")
        self.stdout.write(self.style.SUCCESS("Initial data loaded"))


class Command(BaseCommand):
    help = "Create 10 initial users with specified usernames, emails, and passwords."

    def handle(self, *args, **options):
        password = "user123456"
        for i in range(1, 11):  # From 1 to 10
            username = f"user{i}"
            email = f"{username}@example.com"

            if not User.objects.filter(username=username).exists():
                User.objects.create_user(
                    username=username, email=email, password=password)
                self.stdout.write(self.style.SUCCESS(
                    f"Created user: {username}"))
            else:
                self.stdout.write(self.style.WARNING(
                    f"User {username} already exists"))
