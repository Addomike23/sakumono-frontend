import React, { useState, useEffect, useRef } from 'react'
import { 
  HiOutlineChatAlt2, 
  HiX, 
  HiPaperAirplane, 
  HiUser,
  HiOutlineExclamationCircle,
  HiOutlineSupport,
  HiOutlineChat
} from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatbot } from '../../context/ChatbotContext'
import { useAuth } from '../../context/AuthContext'

// ============================================================
// ANIMATION VARIANTS
// ============================================================
const pulseVariants = {
  initial: { scale: 1, boxShadow: '0 0 0 0 rgba(22, 163, 74, 0.4)' },
  animate: {
    scale: [1, 1.05, 1],
    boxShadow: [
      '0 0 0 0 rgba(22, 163, 74, 0.4)',
      '0 0 0 20px rgba(22, 163, 74, 0)',
      '0 0 0 0 rgba(22, 163, 74, 0)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  hover: {
    scale: 1.08,
    boxShadow: '0 0 30px rgba(22, 163, 74, 0.3)',
    transition: { duration: 0.3 }
  }
}

const bounceVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -8, 0, -6, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

const floatVariants = {
  initial: { y: 0 },
  animate: {
    y: [0, -10, 0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

const ringPulseVariants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.8],
    opacity: [0.8, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeOut'
    }
  }
}

const shimmerVariants = {
  initial: { opacity: 0.3 },
  animate: {
    opacity: [0.3, 0.8, 0.3],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}

const ChatWidget = () => {
  const { 
    isOpen, 
    messages, 
    isTyping, 
    unreadCount, 
    quickReplies,
    toggleChat, 
    sendMessage, 
    handleQuickReply,
    clearMessages
  } = useChatbot()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const [showTooltip, setShowTooltip] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    // Hide tooltip after 10 seconds
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 10000)
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

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-[340px] sm:w-[380px] h-[460px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <motion.div 
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-lg"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                >
                  <HiOutlineSupport />
                </motion.div>
                <div>
                  <p className="font-semibold text-white text-sm">Sakumono Assist</p>
                  <p className="text-[10px] text-green-100 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse inline-block"></span>
                    Online • Ready to help
                  </p>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                aria-label="Close chat"
              >
                <HiX size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-3 bg-gray-50 space-y-2.5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
                  <motion.div
                    animate={{ 
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <HiOutlineSupport className="text-3xl text-gray-300 mb-2" />
                  </motion.div>
                  <p>How can I help you today?</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${
                        msg.sender === 'user'
                          ? 'bg-green-600 text-white rounded-tr-sm'
                          : msg.isError
                          ? 'bg-red-50 border border-red-200 text-red-700'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm shadow-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
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
                            <motion.button
                              key={index}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickReply(reply)}
                              className="px-2.5 py-1 text-xs bg-green-50 text-green-700 rounded-full border border-green-200 hover:bg-green-100 transition-colors"
                            >
                              {reply}
                            </motion.button>
                          ))}
                        </div>
                      )}
                      <span className="text-[9px] opacity-60 mt-1 block">
                        {formatTime(msg.timestamp)}
                      </span>
                    </motion.div>
                  </div>
                ))
              )}
              
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-200 px-3.5 py-2 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="flex items-center gap-1">
                      <motion.div 
                        className="w-1.5 h-1.5 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div 
                        className="w-1.5 h-1.5 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div 
                        className="w-1.5 h-1.5 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {quickReplies.length > 0 && messages.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-2.5 py-1.5 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-1 max-h-14 overflow-y-auto flex-shrink-0"
              >
                {quickReplies.map((reply, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickReply(reply)}
                    className="px-2.5 py-1 text-[11px] bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    {reply}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-2.5 bg-white border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearMessages}
                  className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-1"
                  title="Clear chat"
                >
                  ✕
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3.5 py-1.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                />
                <motion.button
                  type="submit"
                  disabled={!input.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <HiPaperAirplane size={14} className="rotate-90" />
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================ */}
      {/* ATTENTION-GRABBING CHAT BUTTON */}
      {/* ============================================================ */}
      <motion.div
        initial="initial"
        animate={isOpen ? 'initial' : 'animate'}
        whileHover="hover"
        variants={pulseVariants}
        className="relative"
      >
        {/* Pulsing rings (attention grabber) */}
        {!isOpen && (
          <>
            <motion.div
              variants={ringPulseVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 rounded-full bg-green-400/30"
              style={{ width: '100%', height: '100%' }}
            />
            <motion.div
              variants={ringPulseVariants}
              initial="initial"
              animate="animate"
              className="absolute inset-0 rounded-full bg-green-400/20"
              style={{ width: '100%', height: '100%', animationDelay: '0.5s' }}
            />
            {/* Shimmer effect */}
            <motion.div
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
              className="absolute -inset-1 rounded-full bg-gradient-to-r from-transparent via-green-300/30 to-transparent blur-sm"
              style={{ width: '120%', height: '120%', left: '-10%', top: '-10%' }}
            />
          </>
        )}

        {/* Bouncing/Floating button */}
        <motion.div
          animate={isOpen ? 'initial' : 'animate'}
          variants={floatVariants}
        >
          <motion.button
            onClick={toggleChat}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
              w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-2xl transition-all duration-300 relative
              ${isOpen 
                ? 'bg-red-500 hover:bg-red-600 text-white rotate-90' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
              }
            `}
            aria-label={isOpen ? "Close chat" : "Open chat"}
          >
            {isOpen ? (
              <HiX />
            ) : (
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 10, -10, 0],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1
                }}
              >
                <HiOutlineChatAlt2 />
              </motion.div>
            )}

            {/* Attention glow effect */}
            {!isOpen && (
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400/40"
                animate={{
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.1, 0.4],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            )}

            {/* Unread badge */}
            {!isOpen && unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-6 h-6 flex items-center justify-center z-20 border-2 border-white shadow-lg"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </motion.span>
            )}
          </motion.button>
        </motion.div>

        {/* "Chat with us" tooltip - attention grabbing */}
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-xl shadow-xl whitespace-nowrap z-50"
          >
            💬 Chat with us
            <motion.div 
              className="absolute right-0 top-1/2 transform translate-x-full -translate-y-1/2"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <div className="border-4 border-transparent border-l-gray-900" />
            </motion.div>
          </motion.div>
        )}

        {/* Floating "Hey" text */}
        {!isOpen && showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute left-1/2 -translate-x-1/2 -top-12 bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg whitespace-nowrap"
          >
            👋 Need help?
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default ChatWidget