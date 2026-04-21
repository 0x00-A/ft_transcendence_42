# """
# Tests for models.
# """

# from decimal import Decimal
# from django.test import TestCase
# from django.contrib.auth import get_user_model
# from core.models import Recipe


# class ModelTests(TestCase):
#     """Test models."""

#     def test_create_user_with_email_successful(self):
#         """Test creating a user with an email successful."""
#         email = 'test@example.com'
#         password = 'testpass123'
#         user = get_user_model().objects.create_user(
#             email=email,
#             password=password,
#         )

#         self.assertEqual(user.email, email)
#         self.assertTrue(user.check_password(password))

#     def test_creating_superuser_successful(self):
#         """Test creating a superuser is successful"""
#         email = 'test@example.com'
#         password = 'testpass123'
#         user = get_user_model().objects.create_superuser(
#             email=email,
#             password=password,
#         )

#         self.assertTrue(user.is_staff)
#         self.assertTrue(user.is_superuser)

#     def test_normalize_eamil_address(self):
#         """Test normalizing user email address"""
#         email = 'Test@ExAmple.com'
#         user = get_user_model().objects.create_user(
#             email=email,
#         )

#         self.assertEqual(user.email, 'Test@example.com')

#     def test_new_user_without_email_raises_error(self):
#         """Test that creating a user without email raises a ValueError"""
#         with self.assertRaises(ValueError):
#             get_user_model().objects.create_user("", password='12345')

#     def test_create_new_recipe_successful(self):
#         """Test creating a new recipe"""

#         user = get_user_model().objects.create_user(
#             'test@example.com',
#             'testpass',
#         )
#         recipe = Recipe.objects.create(
#             user=user,
#             title='Greek Cretan biscuits',
#             time_minutes=5,
#             price=Decimal('5.50'),
#             description='Sample recipe description',
#         )

#         self.assertEqual(str(recipe), recipe.title)
