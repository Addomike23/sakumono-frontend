import React, { createContext, useState, useContext, useRef, useEffect, useCallback } from 'react'
import { chatbotApi } from '../api/chatbotApi'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const ChatbotContext = createContext()

export const useChatbot = () => {
  const context = useContext(ChatbotContext)
  if (!context) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}

export const ChatbotProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [quickReplies, setQuickReplies] = useState([])
  const [conversationState, setConversationState] = useState('chat')
  const [isInitialized, setIsInitialized] = useState(false)
  const messagesEndRef = useRef(null)
  const initializedRef = useRef(false)
  const messageIdCounter = useRef(0)

  // Generate unique message IDs
  const generateId = () => {
    messageIdCounter.current += 1
    return `msg_${Date.now()}_${messageIdCounter.current}`
  }

  // Initialize with greeting
  const initializeChat = useCallback(async () => {
    if (messages.length === 0 && !isInitialized) {
      try {
        const response = await chatbotApi.getGreeting()
        const greetingText = response.data.message || 
          "👋 Hello! Welcome to Sakumono Community Hospital. I'm Sakumono Assist — your friendly AI receptionist!\n\nHow can I help you today? 😊"
        
        setMessages([
          {
            id: generateId(),
            text: greetingText,
            sender: 'bot',
            timestamp: new Date(),
            isGreeting: true
          }
        ])
        setIsInitialized(true)
        
        // Get quick replies
        try {
          const repliesRes = await chatbotApi.getQuickReplies()
          if (repliesRes.data?.replies) {
            setQuickReplies(repliesRes.data.replies.slice(0, 6))
          }
        } catch (err) {
          console.error('Failed to load quick replies:', err)
        }
      } catch (error) {
        console.error('Failed to load greeting:', error)
        setMessages([
          {
            id: generateId(),
            text: "👋 Hello! Welcome to Sakumono Community Hospital. I'm Sakumono Assist — your friendly AI receptionist!\n\nHow can I help you today? 😊",
            sender: 'bot',
            timestamp: new Date(),
            isGreeting: true
          }
        ])
        setIsInitialized(true)
      }
    }
  }, [messages.length, isInitialized])

  // Auto-initialize chat when component mounts
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      initializeChat()
    }
  }, [initializeChat])

  const toggleChat = useCallback(() => {
    const newState = !isOpen
    setIsOpen(newState)
    
    if (newState) {
      setUnreadCount(0)
      if (messages.length === 0) {
        initializeChat()
      }
    } else {
      setUnreadCount(prev => prev + 1)
    }
  }, [isOpen, messages.length, initializeChat])

  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) return

    // Snapshot prior turns as history
    const historyForRequest = messages.map(({ sender, text, action }) => ({ 
      sender, 
      text,
      action: action || null
    }))

    // Add user message
    const userMessage = {
      id: generateId(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Show typing indicator
    setIsTyping(true)

    try {
      // Send to backend with context
      const response = await chatbotApi.sendMessage(
        text.trim(),
        historyForRequest,
        isAuthenticated && !!user,
        conversationState
      )
      
      // Get quick replies from response or fallback
      const newQuickReplies = response.data.quickReplies || []
      if (newQuickReplies.length > 0) {
        setQuickReplies(newQuickReplies)
      }
      
      // Update conversation state
      if (response.data.conversationState) {
        setConversationState(response.data.conversationState)
      }
      
      // Add bot response
      const botMessage = {
        id: generateId(),
        text: response.data.reply || "I understand. Let me help you with that.",
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: newQuickReplies,
        link: response.data.link || null,
        action: response.data.action || response.data.intent || null
      }
      setMessages(prev => [...prev, botMessage])
      
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: generateId(),
        text: "Sorry, I'm having trouble connecting. 😅 Please try again or contact our support team directly at " + 
              "info@sakumonohospital.com or call +233 55 500 0000.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setIsTyping(false)
    }
  }, [messages, isAuthenticated, user, conversationState])

  const handleQuickReply = useCallback((reply) => {
    sendMessage(reply)
  }, [sendMessage])

  const clearMessages = useCallback(() => {
    setMessages([])
    setQuickReplies([])
    setConversationState('chat')
    setIsInitialized(false)
    initializedRef.current = false
    setTimeout(() => {
      initializeChat()
    }, 100)
  }, [initializeChat])

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages, scrollToBottom])

  // Reset unread count when chat is opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  const value = {
    isOpen,
    messages,
    isTyping,
    unreadCount,
    quickReplies,
    conversationState,
    isInitialized,
    messagesEndRef,
    toggleChat,
    sendMessage,
    handleQuickReply,
    clearMessages,
    initializeChat,
    setIsOpen,
    setUnreadCount,
    scrollToBottom,
    generateId
  }

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}

export default ChatbotContext