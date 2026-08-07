// api/messages.api.js
import axiosClient from './axiosClient';
import { axiosMultipart } from './axiosClient';

export const messagesApi = {
  // Get all message threads
  getThreads: () => axiosClient.get('/messages/threads'),
  
  // Get conversation with a specific user
  getConversation: (userId, params) => 
    axiosClient.get(`/messages/conversation/${userId}`, { params }),
  
  // Send a message (with optional file attachment)
  sendMessage: (data) => axiosMultipart.post('/messages', data),
  
  // Get unread count
  getUnreadCount: () => axiosClient.get('/messages/unread/count'),
  
  // Mark message as read
  markAsRead: (messageId) => axiosClient.put(`/messages/${messageId}/read`),
  
  // Mark all messages from a user as read
  markAllAsRead: (senderId) => axiosClient.put(`/messages/read/all/${senderId}`),
  
  // Delete message
  deleteMessage: (messageId) => axiosClient.delete(`/messages/${messageId}`),
  
  // Search messages
  searchMessages: (query) => axiosClient.get('/messages/search', { params: { q: query } }),
  
  // Get messageable contacts (patients for doctor, doctors for patient)
  getMessageableContacts: (type) => axiosClient.get(`/messages/${type}`),
  
  // Get single message
  getMessage: (messageId) => axiosClient.get(`/messages/${messageId}`)
};