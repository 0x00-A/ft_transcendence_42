from django.test import TestCase
from ..models.user import User
from django.urls import reverse
from rest_framework import status


class ModelTests(TestCase):
    """Test models."""

    def test_create_user_with_email_successful(self):
        """Test creating a user with an email successful."""
        email = 'test@example.com'
        password = 'testpass123'
        username = 'test'
        user = User.objects.create_user(username, email, password);
        # user = get_user_model().objects.create.user(
        #     username=username,
        #     email=email,
        #     password=password,
        # )
        self.assertEqual(user.username, username)
        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
