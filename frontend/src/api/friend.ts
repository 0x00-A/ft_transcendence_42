// api/friendApi.ts
import axios from 'axios';

export interface User {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
}

export interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

const API_BASE_URL = '/api';

export const friendApi = {
  // Get all users
  getAllUsers: async () => {
    const response = await axios.get(`${API_BASE_URL}/users/`);
    return response.data;
  },

  // Send friend request
  sendFriendRequest: async (username: string) => {
    const response = await axios.post(`${API_BASE_URL}/friend-request/send/${username}/`);
    return response.data;
  },

  // Get pending friend requests
  getPendingRequests: async () => {
    const response = await axios.get(`${API_BASE_URL}/friend-requests/pending/`);
    return response.data;
  },

  // Accept friend request
  acceptRequest: async (username: string) => {
    const response = await axios.post(`${API_BASE_URL}/friend-request/accept/${username}/`);
    return response.data;
  },

  // Reject friend request
  rejectRequest: async (username: string) => {
    const response = await axios.post(`${API_BASE_URL}/friend-request/reject/${username}/`);
    return response.data;
  },

  // Get sent requests
  getSentRequests: async () => {
    const response = await axios.get(`${API_BASE_URL}/friend-requests/sent/`);
    return response.data;
  },

  // Cancel sent request
  cancelRequest: async (username: string) => {
    const response = await axios.delete(`${API_BASE_URL}/friend-request/cancel/${username}/`);
    return response.data;
  }
};