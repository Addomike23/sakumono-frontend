import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  HiOutlineChatAlt2, 
  HiX, 
  HiPaperAirplane, 
  HiUser,
  HiOutlineSupport,
  HiOutlineChat,
  HiArrowRight,
  HiBell
} from 'react-icons/hi'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatbot } from '../../context/ChatbotContext'
import { useAuth } from '../../context/AuthContext'

const ChatWidget = () => {
  const navigate = useNavigate()
  const location = useLocation()
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
  const [isVisible, setIsVisible] = useState(true)
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showPopup, setShowPopup] = useState(true)
  const [popupMessageIndex, setPopupMessageIndex] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const popupMessages = [
    { text: "💬 Need help? I'm here!", delay: 3000 },
    { text: "🩺 Ask me about appointments", delay: 8000 },
    { text: "💊 Pharmacy info available", delay: 13000 },
    { text: "👨‍⚕️ Find a doctor now", delay: 18000 },
  ]

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Check if we're on the chat page - hide widget
  const isOnChatPage = location.pathname === '/chat'

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Auto-rotate popup messages
  useEffect(() => {
    if (isOpen || isOnChatPage) {
      setShowPopup(false)
      return
    }

    const timer = setTimeout(() => {
      setPopupMessageIndex((prev) => (prev + 1) % popupMessages.length)
      setShowPopup(true)
    }, popupMessages[popupMessageIndex].delay)

    return () => clearTimeout(timer)
  }, [popupMessageIndex, isOpen, isOnChatPage])

  // Hide popup after showing
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showPopup])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 6000)
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
      if (inputRef.current) {
        inputRef.current.blur()
      }
    }
  }

  const handleOpenChat = () => {
    setShowPopup(false)
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

  // Hide widget on chat page
  if (isOnChatPage || !isVisible) return null

  const currentPopup = popupMessages[popupMessageIndex]

  return (
    <div 
      className="chat-widget-container"
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '19px',
        zIndex: 9999,
        width: 'auto',
        height: 'auto',
        pointerEvents: 'none',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
        transform: 'translateZ(0)',
        WebkitTransform: 'translateZ(0)',
      }}
    >
      <div 
        className="chat-widget-inner"
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          width: 'auto',
          height: 'auto',
          willChange: 'transform',
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
        }}
      >
        {/* ============================================================ */}
        {/* POPUP MESSAGE - FIXED POSITIONING */}
        {/* ============================================================ */}
        {!isOpen && showPopup && !isOnChatPage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: '70px',
              right: '0',
              left: 'auto',
              background: 'linear-gradient(135deg, #059669, #047857)',
              color: 'white',
              padding: '10px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 500,
              boxShadow: '0 8px 25px rgba(5, 150, 105, 0.3)',
              maxWidth: isMobile ? '180px' : '220px',
              minWidth: isMobile ? '140px' : '180px',
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              pointerEvents: 'none',
              zIndex: 60,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              wordBreak: 'break-word',
            }}
          >
            <span style={{ fontSize: isMobile ? '14px' : '18px', flexShrink: 0 }}>💬</span>
            <span style={{ fontSize: isMobile ? '11px' : '13px', lineHeight: 1.3 }}>
              {currentPopup.text}
            </span>
            <div
              style={{
                position: 'absolute',
                bottom: '-8px',
                right: '16px',
                border: '8px solid transparent',
                borderTopColor: '#047857',
              }}
            />
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '10px',
                height: '10px',
                background: '#fcd34d',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                marginBottom: '12px',
                width: '340px',
                maxWidth: 'calc(100vw - 32px)',
                height: '480px',
                maxHeight: 'calc(100vh - 120px)',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
                willChange: 'transform, opacity',
              }}
            >
              {/* Header */}
              <div style={{
                background: 'linear-gradient(to right, #059669, #047857)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    flexShrink: 0,
                  }}>
                    <HiOutlineSupport />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 600, color: 'white', fontSize: '14px', margin: 0 }}>
                      Sakumono Assist
                    </p>
                    <p style={{ fontSize: '10px', color: '#d1fae5', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{
                        display: 'inline-block',
                        width: '6px',
                        height: '6px',
                        background: '#6ee7b7',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite',
                        flexShrink: 0,
                      }} />
                      <span>Online • Ready to help</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleChat}
                  style={{
                    color: 'white',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '50%',
                    padding: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-label="Close chat"
                >
                  <HiX size={18} />
                </button>
              </div>

              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                background: '#f9fafb',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                minHeight: 0,
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#9ca3af',
                    fontSize: '14px',
                  }}>
                    <HiOutlineSupport style={{ fontSize: '32px', color: '#d1d5db', marginBottom: '8px' }} />
                    <p style={{ margin: 0 }}>How can I help you today?</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        maxWidth: '85%',
                        padding: '8px 14px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        ...(msg.sender === 'user'
                          ? {
                              background: '#059669',
                              color: 'white',
                              borderBottomRightRadius: '4px',
                            }
                          : msg.isError
                          ? {
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                            }
                          : {
                              background: 'white',
                              border: '1px solid #e5e7eb',
                              color: '#1f2937',
                              borderBottomLeftRadius: '4px',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                            }
                        ),
                      }}>
                        <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5, wordBreak: 'break-word' }}>
                          {msg.text}
                        </p>
                        {msg.link && (
                          <a
                            href={msg.link}
                            style={{
                              display: 'block',
                              marginTop: '6px',
                              color: '#059669',
                              fontWeight: 500,
                              fontSize: '12px',
                              textDecoration: 'underline',
                            }}
                          >
                            Go here →
                          </a>
                        )}
                        {msg.quickReplies && msg.quickReplies.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                            {msg.quickReplies.map((reply, index) => (
                              <button
                                key={index}
                                onClick={() => handleQuickReply(reply)}
                                style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  background: '#ecfdf5',
                                  color: '#065f46',
                                  borderRadius: '9999px',
                                  border: '1px solid #a7f3d0',
                                  cursor: 'pointer',
                                  transition: 'background 0.2s',
                                }}
                              >
                                {reply}
                              </button>
                            ))}
                          </div>
                        )}
                        <span style={{ fontSize: '9px', opacity: 0.6, display: 'block', marginTop: '4px' }}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                
                {isTyping && (
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <div style={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      padding: '8px 14px',
                      borderRadius: '16px',
                      borderBottomLeftRadius: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          background: '#059669',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite',
                        }} />
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          background: '#059669',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite 0.2s',
                        }} />
                        <span style={{
                          display: 'inline-block',
                          width: '6px',
                          height: '6px',
                          background: '#059669',
                          borderRadius: '50%',
                          animation: 'bounce 1s infinite 0.4s',
                        }} />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies */}
              {quickReplies.length > 0 && messages.length > 0 && (
                <div style={{
                  padding: '6px 10px',
                  background: '#f9fafb',
                  borderTop: '1px solid #f3f4f6',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  maxHeight: '56px',
                  overflowY: 'auto',
                  flexShrink: 0,
                }}>
                  {quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11px',
                        background: 'white',
                        color: '#374151',
                        borderRadius: '9999px',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'background 0.2s',
                      }}
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <form 
                onSubmit={handleSubmit} 
                style={{
                  padding: '10px',
                  background: 'white',
                  borderTop: '1px solid #e5e7eb',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  flexWrap: 'nowrap',
                }}>
                  <button
                    type="button"
                    onClick={clearMessages}
                    style={{
                      color: '#9ca3af',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '12px',
                      padding: '4px 6px',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                    title="Clear chat"
                  >
                    ✕
                  </button>
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: '6px 14px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '9999px',
                      fontSize: '16px',
                      outline: 'none',
                      minWidth: 0,
                    }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    style={{
                      width: '32px',
                      height: '32px',
                      background: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: input.trim() ? 'pointer' : 'default',
                      opacity: input.trim() ? 1 : 0.5,
                      flexShrink: 0,
                      transition: 'background 0.2s',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    <HiPaperAirplane size={14} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================================ */}
        {/* CHAT BUTTON */}
        {/* ============================================================ */}
        {!isOnChatPage && (
          <div
            style={{
              position: 'relative',
              pointerEvents: 'auto',
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
            }}
          >
            {/* Pulsing rings */}
            {!isOpen && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(5, 150, 105, 0.15)',
                    animation: 'pulse-ring 2s ease-out infinite',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    background: 'rgba(5, 150, 105, 0.08)',
                    animation: 'pulse-ring 2s ease-out infinite 0.5s',
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                  }}
                />
              </>
            )}

            {/* Button */}
            <button
              onClick={handleOpenChat}
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                boxShadow: '0 8px 30px rgba(5, 150, 105, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                background: isOpen 
                  ? '#ef4444' 
                  : 'linear-gradient(135deg, #059669, #047857)',
                color: 'white',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
              }}
              aria-label={isOpen ? "Close chat" : "Open chat"}
            >
              {isOpen ? <HiX /> : <HiOutlineChatAlt2 />}

              {/* Unread badge */}
              {!isOpen && unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: 'white',
                    fontSize: '10px',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    zIndex: 20,
                  }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}

              {/* Attention dot */}
              {!isOpen && !showPopup && (
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    background: '#fcd34d',
                    borderRadius: '50%',
                    border: '2px solid white',
                  }}
                />
              )}
            </button>
          </div>
        )}

        {/* Tooltip - Desktop only */}
        {!isOpen && showTooltip && !isMobile && !isOnChatPage && (
          <div
            style={{
              position: 'absolute',
              right: 'calc(100% + 12px)',
              top: '50%',
              transform: 'translateY(-50%)',
              background: '#111827',
              color: 'white',
              fontSize: '12px',
              padding: '8px 14px',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 50,
              animation: 'fade-in 0.4s ease-out',
            }}
          >
            💬 Chat with us
            <div
              style={{
                position: 'absolute',
                right: '-6px',
                top: '50%',
                transform: 'translateY(-50%)',
                border: '6px solid transparent',
                borderLeftColor: '#111827',
              }}
            />
          </div>
        )}

        {/* Mobile indicator */}
        {isMobile && !isOpen && !isOnChatPage && (
          <div
            style={{
              position: 'absolute',
              bottom: '-14px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '8px',
              color: '#059669',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              background: 'rgba(255,255,255,0.9)',
              padding: '2px 8px',
              borderRadius: '9999px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #f3f4f6',
              pointerEvents: 'none',
            }}
          >
            Tap to chat
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(-50%) scale(0.95); }
            100% { opacity: 1; transform: translateY(-50%) scale(1); }
          }
          @keyframes slide-in {
            0% { opacity: 0; transform: translateY(10px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .chat-widget-container {
            -webkit-backface-visibility: hidden;
            backface-visibility: hidden;
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }
          .chat-widget-inner {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }
          input[type="text"] {
            font-size: 16px !important;
          }
          @media (max-width: 768px) {
            .chat-widget-container {
              bottom: 16px !important;
              right: 12px !important;
            }
          }
        `
      }} />
    </div>
  )
}

export default ChatWidget