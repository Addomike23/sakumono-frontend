import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { messagesApi } from '../api/messages.api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

// Create context with default value
const MessageContext = createContext(null);

// Add safety check in the hook
export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    console.warn('useMessages must be used within a MessageProvider - returning default values');
    return {
      threads: [],
      currentConversation: null,
      messages: [],
      unreadCount: 0,
      loading: false,
      isTyping: false,
      onlineUsers: [],
      socketConnected: false,
      reconnecting: false,
      loadThreads: () => {},
      loadConversation: () => {},
      sendMessage: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteMessage: () => {},
      searchMessages: () => Promise.resolve([]),
      getMessageableContacts: () => Promise.resolve([]),
      sendTyping: () => {},
      setCurrentConversation: () => {},
      startNewConversation: () => {},
      addThread: () => {}
    };
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  
  // Use refs to prevent unnecessary re-renders
  const currentConversationRef = useRef(null);
  const messagesRef = useRef([]);
  const threadsRef = useRef([]);
  const socketRef = useRef(null);
  const isMounted = useRef(true);
  const isLoadingThreads = useRef(false);
  const isUpdatingMessages = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    currentConversationRef.current = currentConversation;
  }, [currentConversation]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  // ===============================
  // LOAD MESSAGE THREADS
  // ===============================
  const loadThreads = useCallback(async () => {
    if (!user || !isMounted.current || isLoadingThreads.current) return;
    try {
      isLoadingThreads.current = true;
      setLoading(true);
      const response = await messagesApi.getThreads();
      if (!isMounted.current) return;
      const threadData = response.data.data || [];
      setThreads(threadData);
      threadsRef.current = threadData;
      
      const totalUnread = threadData.reduce((acc, thread) => acc + (thread.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
      
      return threadData;
    } catch (error) {
      console.error('Failed to load threads:', error);
      if (error.response?.status !== 401) {
        toast.error('Failed to load messages');
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isLoadingThreads.current = false;
      }
    }
  }, [user]);

  // ===============================
  // LOAD CONVERSATION
  // ===============================
  const loadConversation = useCallback(async (userId, markAsRead = true) => {
    if (!userId || !isMounted.current || isLoadingThreads.current) return;
    try {
      isLoadingThreads.current = true;
      setLoading(true);
      const response = await messagesApi.getConversation(userId);
      if (!isMounted.current) return;
      const data = response.data.data;
      
      setCurrentConversation(data.otherUser);
      currentConversationRef.current = data.otherUser;
      setMessages(data.messages || []);
      messagesRef.current = data.messages || [];
      
      if (markAsRead && data.unreadCount > 0) {
        await messagesApi.markAllAsRead(userId);
        await loadThreads();
      }
      
      return data;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        isLoadingThreads.current = false;
      }
    }
  }, [loadThreads]);

  // ===============================
  // SEND MESSAGE
  // ===============================
  const sendMessage = useCallback(async (receiverId, content, attachment = null) => {
    if (!content?.trim() && !attachment) {
      toast.error('Please enter a message');
      return null;
    }
    
    try {
      const formData = new FormData();
      formData.append('receiverId', receiverId);
      formData.append('content', content || '');
      if (attachment) {
        formData.append('attachment', attachment);
      }

      const response = await messagesApi.sendMessage(formData);
      const newMessage = response.data.data;

      // Update messages list
      setMessages(prev => [newMessage, ...prev]);
      messagesRef.current = [newMessage, ...messagesRef.current];

      // Update threads
      await loadThreads();

      // Emit via socket
      if (socketRef.current && socketConnected) {
        socketRef.current.emit('send_message', {
          ...newMessage,
          receiverId,
          senderId: user._id
        });
      }

      return newMessage;
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
      throw error;
    }
  }, [user, socketConnected, loadThreads]);

  // ===============================
  // MARK MESSAGE AS READ
  // ===============================
  const markAsRead = useCallback(async (messageId) => {
    try {
      await messagesApi.markAsRead(messageId);
      
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
      await loadThreads();

      if (socketRef.current && socketConnected) {
        socketRef.current.emit('message_read', { messageId, senderId: currentConversationRef.current?._id });
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  }, [socketConnected, loadThreads]);

  // ===============================
  // MARK ALL AS READ
  // ===============================
  const markAllAsRead = useCallback(async (senderId) => {
    try {
      const response = await messagesApi.markAllAsRead(senderId);
      
      setMessages(prev => prev.map(msg => 
        msg.sender?._id === senderId ? { ...msg, isRead: true, readAt: new Date() } : msg
      ));
      
      setUnreadCount(prev => Math.max(0, prev - (response.data.data?.modifiedCount || 0)));
      await loadThreads();

      if (socketRef.current && socketConnected) {
        socketRef.current.emit('messages_read_all', { senderId });
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [socketConnected, loadThreads]);

  // ===============================
  // DELETE MESSAGE
  // ===============================
  const deleteMessage = useCallback(async (messageId) => {
    try {
      await messagesApi.deleteMessage(messageId);
      
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      messagesRef.current = messagesRef.current.filter(msg => msg._id !== messageId);
      
      await loadThreads();

      if (socketRef.current && socketConnected) {
        socketRef.current.emit('delete_message', { messageId });
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
      toast.error('Failed to delete message');
    }
  }, [socketConnected, loadThreads]);

  // ===============================
  // SEARCH MESSAGES
  // ===============================
  const searchMessages = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];
    try {
      const response = await messagesApi.searchMessages(query);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to search messages:', error);
      toast.error('Failed to search messages');
      return [];
    }
  }, []);

  // ===============================
  // GET MESSAGEABLE CONTACTS
  // ===============================
  const getMessageableContacts = useCallback(async () => {
    if (!user) return [];
    try {
      const endpoint = user.role === 'doctor' ? 'patients' : 'doctors';
      const response = await messagesApi.getMessageableContacts(endpoint);
      return response.data.data || [];
    } catch (error) {
      console.error('Failed to get contacts:', error);
      toast.error('Failed to load contacts');
      return [];
    }
  }, [user]);

  // ===============================
  // START NEW CONVERSATION
  // ===============================
  const startNewConversation = useCallback((userData) => {
    if (!userData || !userData._id) {
      console.warn('Invalid user data for new conversation');
      return;
    }

    const existingThread = threads.find(t => t.user?._id === userData._id);
    if (existingThread) {
      setCurrentConversation(existingThread.user);
      currentConversationRef.current = existingThread.user;
      loadConversation(userData._id);
      return;
    }

    const newThread = {
      user: {
        _id: userData._id,
        firstName: userData.firstName || 'Unknown',
        lastName: userData.lastName || '',
        profileImage: userData.profileImage || null,
        role: userData.role || 'doctor',
        specialization: userData.specialization || null
      },
      lastMessage: null,
      unreadCount: 0,
      isNew: true
    };

    setThreads(prev => [newThread, ...prev]);
    threadsRef.current = [newThread, ...threadsRef.current];
    
    setCurrentConversation(newThread.user);
    currentConversationRef.current = newThread.user;
    setMessages([]);
    messagesRef.current = [];

    return newThread;
  }, [threads, loadConversation]);

  // ===============================
  // ADD THREAD
  // ===============================
  const addThread = useCallback((threadData) => {
    if (!threadData || !threadData.user) {
      console.warn('Invalid thread data');
      return;
    }

    const exists = threads.some(t => t.user?._id === threadData.user._id);
    if (exists) return;

    setThreads(prev => [threadData, ...prev]);
    threadsRef.current = [threadData, ...threadsRef.current];
  }, [threads]);

  // ===============================
  // SOCKET SETUP - FIXED
  // ===============================
  const setupSocket = useCallback(() => {
    if (!user) return;

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const token = localStorage.getItem('sch_token');
    
    if (!token) {
      console.warn('No token found for socket connection');
      return;
    }

    try {
      const newSocket = io(socketUrl, {
        auth: { token },
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000
      });

      newSocket.on('connect', () => {
        console.log('Socket connected successfully');
        setSocketConnected(true);
        setReconnecting(false);
        newSocket.emit('authenticate', user._id);
        newSocket.emit('join-room', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setSocketConnected(false);
      });

      newSocket.on('reconnecting', (attempt) => {
        console.log(`Reconnecting socket... Attempt ${attempt}`);
        setReconnecting(true);
      });

      newSocket.on('reconnect', () => {
        console.log('Socket reconnected');
        setSocketConnected(true);
        setReconnecting(false);
        newSocket.emit('authenticate', user._id);
        newSocket.emit('join-room', user._id);
      });

      // ✅ FIXED: New message received - no infinite loops
      newSocket.on('new_message', (data) => {
        const messageData = data.message || data;
        const convId = currentConversationRef.current?._id;
        const senderId = messageData.sender?._id || messageData.sender;
        
        // ✅ Check if message already exists
        const messageExists = messagesRef.current.some(msg => msg._id === messageData._id);
        if (messageExists) return;

        // ✅ Add message if in current conversation
        if (senderId === convId || messageData.receiver?._id === convId) {
          setMessages(prev => [messageData, ...prev]);
          messagesRef.current = [messageData, ...messagesRef.current];
          
          // Auto-mark as read if in current conversation
          if (senderId === convId && messageData.sender?._id !== user._id) {
            messagesApi.markAsRead(messageData._id).catch(console.error);
          }
        }
        
        // ✅ Update threads without causing loop
        if (!isLoadingThreads.current) {
          loadThreads();
        }
        
        // Show notification
        if (messageData.sender && messageData.sender._id !== user._id) {
          toast.success(`New message from ${messageData.sender.firstName || 'Unknown'}`, {
            duration: 4000,
            icon: '💬'
          });
        }
      });

      newSocket.on('message_sent', (data) => {
        console.log('Message sent confirmation:', data);
        if (!isLoadingThreads.current) {
          loadThreads();
        }
      });

      newSocket.on('message_read', ({ messageId }) => {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, readAt: new Date() } : msg
        ));
      });

      newSocket.on('messages_read', ({ byUser, count }) => {
        if (byUser === user._id) return;
        if (!isLoadingThreads.current) {
          loadThreads();
        }
      });

      newSocket.on('message_deleted', ({ messageId }) => {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        messagesRef.current = messagesRef.current.filter(msg => msg._id !== messageId);
      });

      newSocket.on('user_typing', ({ userId, isTyping }) => {
        if (userId === currentConversationRef.current?._id) {
          setIsTyping(isTyping);
        }
      });

      newSocket.on('user_online', ({ userId, status }) => {
        setOnlineUsers(prev => {
          if (status && !prev.includes(userId)) {
            return [...prev, userId];
          }
          if (!status) {
            return prev.filter(id => id !== userId);
          }
          return prev;
        });
      });

      newSocket.on('unread_count_updated', ({ count }) => {
        setUnreadCount(count);
      });

      socketRef.current = newSocket;
      return newSocket;

    } catch (error) {
      console.error('Socket setup error:', error);
      setSocketConnected(false);
    }
  }, [user, loadThreads]);

  // ===============================
  // SEND TYPING INDICATOR
  // ===============================
  const sendTyping = useCallback((receiverId, isTyping) => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit('typing', { receiverId, isTyping });
    }
  }, [socketConnected]);

  // ===============================
  // INITIALIZE SOCKET
  // ===============================
  useEffect(() => {
    if (user) {
      const newSocket = setupSocket();
      return () => {
        isMounted.current = false;
        if (newSocket) {
          newSocket.disconnect();
        }
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user]);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    if (user) {
      loadThreads();
      
      const interval = setInterval(() => {
        if (!socketConnected && !isLoadingThreads.current) {
          loadThreads();
        }
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, loadThreads, socketConnected]);

  // ===============================
  // CONTEXT VALUE
  // ===============================
  const value = React.useMemo(() => ({
    threads,
    currentConversation,
    messages,
    unreadCount,
    loading,
    isTyping,
    onlineUsers,
    socketConnected,
    reconnecting,
    loadThreads,
    loadConversation,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    searchMessages,
    getMessageableContacts,
    sendTyping,
    setCurrentConversation,
    startNewConversation,
    addThread
  }), [
    threads,
    currentConversation,
    messages,
    unreadCount,
    loading,
    isTyping,
    onlineUsers,
    socketConnected,
    reconnecting,
    loadThreads,
    loadConversation,
    sendMessage,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    searchMessages,
    getMessageableContacts,
    sendTyping,
    setCurrentConversation,
    startNewConversation,
    addThread
  ]);

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};