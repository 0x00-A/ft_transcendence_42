import apiClient from './apiClient';

export const apiCreateConversation = async (user2Id: string) => {
    try {
        const response = await apiClient.post(`/chat/conversations/create/`, { user2_id: user2Id });
        return response.data || 'Conversation created successfully';
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Failed to create conversation');
        }
    }
};
export const apiGetUser = async (username: string) => {
    try {
        const response = await apiClient.get(`/profile/${username}/`);
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        }
    }
};

export const apiGetConversationMessages = async (conversationId: number, page: number) => {
    try {
        const response = await apiClient.get(`/chat/conversations/${conversationId}/messages/?page=${page}`);
      return response.data;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
        }
        throw new Error('An error occurred while fetching conversation messages.');
    }
};

export const apiGetConversations = async () => {
    try {
      const response = await apiClient.get('/chat/conversations');
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      }
    }
  };
  