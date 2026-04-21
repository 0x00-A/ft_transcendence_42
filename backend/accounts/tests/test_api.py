from django.test import TestCase, SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
# from .models import User, Profile, FriendRequest
from ..models.profile import Profile
from ..models.friends import FriendRequest
from ..models.user import User

class FriendRequestViewTests(APITestCase):
    def setUp(self):
        # Create users and profiles for testing
        self.user1 = User.objects.create_user(email='email1@example.com' , username='user1', password='password123')
        self.user2 = User.objects.create_user(email='email2@example.com' , username='user2', password='password123')
        self.profile1 = Profile.objects.create(user=self.user1)
        self.profile2 = Profile.objects.create(user=self.user2)

        # Obtain JWT token
        self.token = self.get_jwt_token(self.user1)

    def get_jwt_token(self, user):
        url = reverse('token_obtain_pair')  # Adjust based on your URL pattern
        response = self.client.post(url, {'username': user.username, 'password': 'password123'})
        return response.data['access']
    
    def test_send_friend_request(self):
        url = reverse('send-friend-request', args=['user2'])
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(FriendRequest.objects.filter(sender=self.profile1, receiver=self.profile2).exists())

    def test_send_friend_request_to_self(self):
        url = reverse('send-friend-request', args=['user1'])
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['error'], 'Cannot send friend request to yourself')

    def test_accept_friend_request(self):
        # First, send a friend request
        FriendRequest.objects.create(sender=self.profile2, receiver=self.profile1, status='pending')
        
        url = reverse('accept-friend-request', args=['user2'])
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(FriendRequest.objects.get(sender=self.profile2, receiver=self.profile1).status, 'accepted')
        self.assertTrue(self.profile1.friends.filter(user=self.user2).exists())

    def test_reject_friend_request(self):
        # First, send a friend request
        friend_request = FriendRequest.objects.create(sender=self.profile2, receiver=self.profile1, status='pending')
        
        url = reverse('reject-friend-request', args=['user2'])
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.post(url)

        friend_request.refresh_from_db()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(friend_request.status, 'rejected')

    def test_cancel_friend_request(self):
        # First, send a friend request
        friend_request = FriendRequest.objects.create(sender=self.profile1, receiver=self.profile2, status='pending')
        
        url = reverse('cancel-friend-request', args=['user2'])
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(FriendRequest.objects.filter(pk=friend_request.pk).exists())

    def test_list_friend_requests(self):
        # Create some friend requests
        FriendRequest.objects.create(sender=self.profile1, receiver=self.profile2, status='pending')
        
        url = reverse('friend-request-list')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Check if the friend request is listed

    def test_list_pending_friend_requests(self):
        FriendRequest.objects.create(sender=self.profile2, receiver=self.profile1, status='pending')
        
        url = reverse('pending-friend-requests')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + self.token) 
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)  # Check if the pending request is listed


