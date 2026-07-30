import axiosClient from "./axiosClient";

export const chatbotApi = {
  // Send message to chatbot. Pass history so the model has conversational
  // context, and isAuthed so we hit the route that populates req.user.
  sendMessage: (message, history = [], isAuthed = false) =>
    axiosClient.post(
      isAuthed ? '/chatbot/message/auth' : '/chatbot/message',
      { message, history }
    ),

  // Get quick replies
  getQuickReplies: () => axiosClient.get('/chatbot/quick-replies'),

  // Get greeting message
  getGreeting: () => axiosClient.get('/chatbot/greeting'),

  // Get chatbot suggestions
  getSuggestions: (query) => axiosClient.get(`/chatbot/suggestions?q=${query}`),

  // Get FAQ responses
  getFaq: () => axiosClient.get('/chatbot/faq'),
};