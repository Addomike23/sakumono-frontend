import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  HiPaperAirplane, 
  HiOutlineSupport,
  HiOutlineChatAlt2,
  HiArrowLeft,
  HiUser,
  HiCheckCircle
} from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatbot } from '../../context/ChatbotContext'
import { useAuth } from '../../context/AuthContext'

const ChatPage = () => {
  const { 
    messages, 
    isTyping, 
    quickReplies,
    sendMessage, 
    handleQuickReply,
    clearMessages,
    initializeChat
  } = useChatbot()
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    // Initialize chat if empty
    if (messages.length === 0) {
      initializeChat()
    }
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              aria-label="Back to home"
            >
              <HiArrowLeft size={20} />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white text-xl">
                <HiOutlineSupport />
              </div>
              <div>
                <h1 className="font-semibold text-white text-base">Sakumono Assist</h1>
                <p className="text-[11px] text-green-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse inline-block"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearMessages}
              className="text-white/80 hover:text-white text-xs px-3 py-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              Clear chat
            </button>
            {user && (
              <div className="flex items-center gap-1.5 text-white/80 text-xs">
                <HiUser size={14} />
                <span>{user.firstName || 'Guest'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 overflow-y-auto">
        <div className="space-y-3">
          {/* Date indicator */}
          {messages.length > 0 && (
            <div className="text-center">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {formatDate(messages[0]?.timestamp || new Date())}
              </span>
            </div>
          )}

          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] text-gray-400">
              <motion.div
                animate={{ 
                  y: [0, -8, 0],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <HiOutlineChatAlt2 className="text-5xl text-gray-300 mb-4" />
              </motion.div>
              <p className="text-lg font-medium text-gray-600">How can I help you today?</p>
              <p className="text-sm text-gray-400 mt-1">Ask me about appointments, doctors, services, or just say hi!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index - 1]?.timestamp)
              return (
                <React.Fragment key={msg.id}>
                  {showDate && index > 0 && (
                    <div className="text-center my-4">
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className={`max-w-[85%] md:max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
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
                          className="block mt-2 text-green-600 font-medium hover:text-green-700 text-sm underline"
                        >
                          Go here →
                        </a>
                      )}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {msg.quickReplies.map((reply, idx) => (
                            <motion.button
                              key={idx}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleQuickReply(reply)}
                              className="px-3 py-1.5 text-xs bg-white text-green-700 rounded-full border border-green-200 hover:bg-green-50 transition-colors shadow-sm"
                            >
                              {reply}
                            </motion.button>
                          ))}
                        </div>
                      )}
                      <span className="text-[10px] opacity-60 mt-2 block">
                        {formatTime(msg.timestamp)}
                      </span>
                    </motion.div>
                  </div>
                </React.Fragment>
              )
            })
          )}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                <div className="flex items-center gap-1.5">
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div 
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Replies - Floating */}
      {quickReplies.length > 0 && messages.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full mx-auto px-4 pb-2"
        >
          <div className="flex flex-wrap gap-1.5">
            {quickReplies.map((reply, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1.5 text-xs bg-white text-gray-700 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
              >
                {reply}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 transition"
            />
            <motion.button
              type="submit"
              disabled={!input.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-green-600/20"
            >
              <HiPaperAirplane size={18} className="rotate-90" />
            </motion.button>
          </form>
          <p className="text-[10px] text-gray-400 text-center mt-2">
            Sakumono Assist is here to help • Responses are AI-generated
          </p>
        </div>
      </div>
    </div>
  )
}

export default ChatPage