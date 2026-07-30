import React, { createContext, useState, useContext, useRef, useEffect } from 'react'
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
  const messagesEndRef = useRef(null)
  const initializedRef = useRef(false)

  // Auto-initialize chat when component mounts
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      initializeChat()
    }
  }, [])

  // Initialize with greeting
  const initializeChat = async () => {
    if (messages.length === 0) {
      try {
        const response = await chatbotApi.getGreeting()
        setMessages([
          {
            id: Date.now(),
            text: response.data.message || "Hello! Welcome to Sakumono Community Hospital. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
            isGreeting: true
          }
        ])
      } catch (error) {
        console.error('Failed to load greeting:', error)
        setMessages([
          {
            id: Date.now(),
            text: "Hello! Welcome to Sakumono Community Hospital. How can I assist you today?",
            sender: 'bot',
            timestamp: new Date(),
            isGreeting: true
          }
        ])
      }
    }
  }

  const toggleChat = () => {
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
  }

  const sendMessage = async (text) => {
    if (!text || !text.trim()) return

    // Snapshot prior turns as history BEFORE adding the new user message,
    // trimmed to the fields the backend actually reads (sender, text).
    const historyForRequest = messages.map(({ sender, text }) => ({ sender, text }))

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Show typing indicator
    setIsTyping(true)

    try {
      // Send to backend, with history + auth-aware routing
      const response = await chatbotApi.sendMessage(
        text.trim(),
        historyForRequest,
        isAuthenticated && !!user
      )
      
      // Add bot response
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.reply || "I understand. Let me help you with that.",
        sender: 'bot',
        timestamp: new Date(),
        quickReplies: response.data.quickReplies || [],
        link: response.data.link || null,
        action: response.data.intent || null
      }
      setMessages(prev => [...prev, botMessage])
      
      // Update quick replies
      if (response.data.quickReplies && response.data.quickReplies.length > 0) {
        setQuickReplies(response.data.quickReplies)
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again or contact our support team directly.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    } finally {
      setIsTyping(false)
    }
  }

  const handleQuickReply = (reply) => {
    sendMessage(reply)
  }

  const clearMessages = () => {
    setMessages([])
    setQuickReplies([])
    initializeChat()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const value = {
    isOpen,
    messages,
    isTyping,
    unreadCount,
    quickReplies,
    messagesEndRef,
    toggleChat,
    sendMessage,
    handleQuickReply,
    clearMessages,
    initializeChat,
    setIsOpen,
    setUnreadCount,
    scrollToBottom
  }

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  )
}

export default ChatbotContext