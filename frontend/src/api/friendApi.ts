import apiClient from './apiClient';


export const  apiSendFriendRequest = async (username: string) => {
    try {
    const response = await apiClient.post(`/friend-request/send/${username}/`);
    return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Failed to send friend request');
        }
    }
};

export const apiAcceptFriendRequest = async (username: string) => {
    try {
        const response = await apiClient.post(`/friend-request/accept/${username}/`);
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Failed to accept friend request');
            }
        }
    };

export const apiRejectFriendRequest = async (username: string) => {
    try {
        const response = await apiClient.post(`/friend-request/reject/${username}/`);
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Error rejecting friend request');
        }
    }
};

export const apiRemoveFriend = async (username: string) => {
    try {
        const response = await apiClient.delete(`/friend/remove/${username}/`);
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Error Friend removed');
        }
    }
};


export const apiCancelFriendRequest = async (username: string) => {
    try {
        const response = await apiClient.delete(`/friend-request/cancel/${username}/`);
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Failed to cancel friend request');
            }
        }
    };

export const apiBlockRequest = async (username : string) => {
    try {
        const response = await apiClient.post(`/block/${username}/`);
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Failed to blocking user');
            }
        }
    };

export const apiUnBlockRequest = async (username : string) => {
    try {
        const response = await apiClient.post(`/unblock/${username}/`);
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data && error.response.data.error) {
            throw new Error(error.response.data.error);
        } else {
            throw new Error('Failed to unblocking user');
            }
        }
    };