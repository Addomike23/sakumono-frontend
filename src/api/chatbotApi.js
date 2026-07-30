import axiosClient from "./axiosClient";

export const chatbotApi = {
  /**
   * Send a message to the chatbot
   * @param {string} message - User's message
   * @param {Array} history - Previous messages {sender, text}
   * @param {boolean} isAuthenticated - Whether user is logged in
   * @param {string} conversationState - Current conversation state
   */
  sendMessage: (message, history = [], isAuthenticated = false, conversationState = 'chat') => {
    // If authenticated, use the protected route
    const endpoint = isAuthenticated ? "/chatbot/message/auth" : "/chatbot/message";
    return axiosClient.post(endpoint, {
      message,
      history,
      isAuthenticated,
      conversationState
    });
  },

  /**
   * Get quick reply suggestions
   */
  getQuickReplies: () => {
    return axiosClient.get("/chatbot/quick-replies");
  },

  /**
   * Get initial greeting message
   */
  getGreeting: () => {
    return axiosClient.get("/chatbot/greeting");
  },

  /**
   * Reset conversation (authenticated users only)
   */
  resetConversation: () => {
    return axiosClient.post("/chatbot/reset");
  },

  /**
   * Get conversation history (authenticated users only)
   */
  getHistory: () => {
    return axiosClient.get("/chatbot/history");
  }
};