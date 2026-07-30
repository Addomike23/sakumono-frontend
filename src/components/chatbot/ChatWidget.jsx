import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  HiOutlineChatAlt2, 
  HiX, 
  HiPaperAirplane, 
  HiUser,
  HiOutlineExclamationCircle,
  HiOutlineSupport,
  HiOutlineChat,
  HiArrowRight
} from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatbot } from '../../context/ChatbotContext'
import { useAuth } from '../../context/AuthContext'

// ============================================================
// ANIMATION VARIANTS - Optimized for performance
// ============================================================
const pulseVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  hover: {
    scale: 1.08,
    transition: { duration: 0.3 }
  }
}

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -6, 0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

const ChatWidget = () => {
  const navigate = useNavigate()
  const { 
    isOpen, 
    messages, 
    isTyping, 
    unreadCount, 
    quickReplies,
    toggleChat, 
    sendMessage, 
    handleQuickReply,
    clearMessages,
    setIsOpen
  } = useChatbot()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [showTooltip, setShowTooltip] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef(null)

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
    }
  }

  const handleOpenChat = () => {
    if (isMobile) {
      navigate('/chat')
      setIsOpen(false)
    } else {
      toggleChat()
    }
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    // ✅ Fixed: Use fixed positioning and prevent layout shifts
    <div className="fixed bottom-4 right-4 z-[9999] pointer-events-none">
      <div className="pointer-events-auto relative">
        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mb-3 w-[340px] sm:w-[380px] h-[480px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
              style={{ willChange: 'transform, opacity' }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-lg flex-shrink-0">
                    <HiOutlineSupport />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm truncate">Sakumono Assist</p>
                    <p className="text-[10px] text-green-100 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse inline-block flex-shrink-0"></span>
                      <span>Online • Ready to help</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  className="text-white hover:bg-white/20 rounded-full p-1 transition-colors flex-shrink-0"
                  aria-label="Close chat"
                >
                  <HiX size={18} />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50 space-y-2.5 min-h-0">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                    <HiOutlineSupport className="text-3xl text-gray-300 mb-2" />
                    <p>How can I help you today?</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${
                          msg.sender === 'user'
                            ? 'bg-green-600 text-white rounded-tr-sm'
                            : msg.isError
                            ? 'bg-red-50 border border-red-200 text-red-700'
                            : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-relaxed break-words">{msg.text}</p>
                        {msg.link && (
                          <a
                            href={msg.link}
                            className="block mt-1.5 text-green-600 font-medium hover:text-green-700 text-xs underline"
                          >
                            Go here →
                          </a>
                        )}
                        {msg.quickReplies && msg.quickReplies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {msg.quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                        <span className="text-[9px] opacity-60 mt-1 block">
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 px-3.5 py-2 rounded-2xl rounded-tl-sm shadow-sm">
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && messages.length > 0 && (
                <div className="px-2.5 py-1.5 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1 max-h-14 overflow-y-auto flex-shrink-0">
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-2.5 py-1 text-[11px] bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-2.5 bg-white border-t border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearMessages}
                    className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-1 flex-shrink-0"
                    title="Clear chat"
                  >
                    ✕
                  </button>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-3.5 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 min-w-0"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <HiPaperAirplane size={14} className="rotate-90" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* CHAT BUTTON - Fixed positioning and no layout shift */}
        {/* ============================================================ */}
        <motion.div
          animate={isOpen ? 'initial' : 'animate'}
          whileHover="hover"
          variants={pulseVariants}
          className="relative"
          style={{ willChange: 'transform' }}
        >
          {/* Pulsing rings - Only show when not open */}
          {!isOpen && (
            <>
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400/20"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
                style={{ width: '100%', height: '100%' }}
              />
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400/10"
                animate={{
                  scale: [1, 1.8, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeOut',
                  delay: 0.5
                }}
                style={{ width: '100%', height: '100%' }}
              />
            </>
          )}

          {/* Button */}
          <motion.button
            onClick={handleOpenChat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-colors duration-300 relative
              ${isOpen 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }
            `}
            style={{ willChange: 'transform' }}
            aria-label={isOpen ? "Close chat" : "Open chat"}
          >
            {isOpen ? (
              <HiX />
            ) : (
              <HiOutlineChatAlt2 />
            )}

            {/* Unread badge */}
            {!isOpen && unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center z-20 border-2 border-white shadow-lg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </motion.button>
        </motion.div>

        {/* Tooltip - Only show on desktop */}
        {!isOpen && showTooltip && !isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl whitespace-nowrap z-50"
          >
            💬 Chat with us
            <div className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2">
              <div className="border-4 border-transparent border-l-gray-900" />
            </div>
          </motion.div>
        )}

        {/* Mobile indicator */}
        {isMobile && !isOpen && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] text-green-600 font-medium whitespace-nowrap bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-gray-100">
            Tap to chat
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatWidget