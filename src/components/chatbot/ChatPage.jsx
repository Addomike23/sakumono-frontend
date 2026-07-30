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
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (messages.length === 0) {
      initializeChat()
    }
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Handle keyboard visibility
  useEffect(() => {
    const handleResize = () => {
      // Detect if keyboard is open (viewport height reduced)
      const isKeyboard = window.innerHeight < window.outerHeight * 0.8
      setIsKeyboardVisible(isKeyboard)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }, 100)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim()) {
      sendMessage(input)
      setInput('')
      // Blur input to dismiss keyboard
      if (inputRef.current) {
        inputRef.current.blur()
      }
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
    <div 
      className="chat-page-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#f9fafb',
        height: '100vh',
        height: '100dvh', // Dynamic viewport height for mobile
        overflow: 'hidden',
        WebkitOverflowScrolling: 'touch',
        // Prevent zoom
        touchAction: 'manipulation',
        WebkitTextSizeAdjust: '100%',
      }}
    >
      {/* Header - Fixed */}
      <div style={{
        flexShrink: 0,
        background: 'linear-gradient(to right, #059669, #047857)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        minHeight: '56px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link 
            to="/" 
            style={{
              color: 'white',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '50%',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
              textDecoration: 'none',
            }}
            aria-label="Back to home"
          >
            <HiArrowLeft size={20} />
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
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
            <div>
              <h1 style={{ 
                fontWeight: 600, 
                color: 'white', 
                fontSize: '16px', 
                margin: 0,
                lineHeight: 1.2,
              }}>
                Sakumono Assist
              </h1>
              <p style={{ 
                fontSize: '11px', 
                color: '#d1fae5', 
                margin: 0, 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px' 
              }}>
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
        </div>
        <button
          onClick={clearMessages}
          style={{
            color: 'rgba(255,255,255,0.8)',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
        >
          Clear chat
        </button>
      </div>

      {/* Messages - Flexible */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        paddingBottom: isKeyboardVisible ? '80px' : '16px',
        WebkitOverflowScrolling: 'touch',
        // Prevent zoom
        touchAction: 'pan-y',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '50vh',
              color: '#9ca3af',
            }}>
              <HiOutlineChatAlt2 style={{ fontSize: '48px', color: '#d1d5db', marginBottom: '16px' }} />
              <p style={{ fontSize: '18px', fontWeight: 500, color: '#4b5563', margin: 0 }}>
                How can I help you today?
              </p>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
                Ask me about appointments, doctors, or just say hi!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(messages[index - 1]?.timestamp)
              return (
                <React.Fragment key={msg.id}>
                  {showDate && index > 0 && (
                    <div style={{ textAlign: 'center', margin: '8px 0' }}>
                      <span style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        background: '#f3f4f6',
                        padding: '4px 12px',
                        borderRadius: '20px',
                      }}>
                        {formatDate(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div style={{
                      maxWidth: '85%',
                      padding: '10px 16px',
                      borderRadius: '16px',
                      fontSize: '15px',
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
                            fontSize: '13px',
                            textDecoration: 'underline',
                          }}
                        >
                          Go here →
                        </a>
                      )}
                      {msg.quickReplies && msg.quickReplies.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                          {msg.quickReplies.map((reply, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleQuickReply(reply)}
                              style={{
                                padding: '4px 12px',
                                fontSize: '12px',
                                background: msg.sender === 'user' ? 'rgba(255,255,255,0.2)' : '#ecfdf5',
                                color: msg.sender === 'user' ? 'white' : '#065f46',
                                borderRadius: '20px',
                                border: msg.sender === 'user' ? '1px solid rgba(255,255,255,0.3)' : '1px solid #a7f3d0',
                                cursor: 'pointer',
                              }}
                            >
                              {reply}
                            </button>
                          ))}
                        </div>
                      )}
                      <span style={{ fontSize: '10px', opacity: 0.6, display: 'block', marginTop: '4px' }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              )
            })
          )}
          
          {isTyping && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                padding: '10px 16px',
                borderRadius: '16px',
                borderBottomLeftRadius: '4px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    background: '#059669',
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite',
                  }} />
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    background: '#059669',
                    borderRadius: '50%',
                    animation: 'bounce 1s infinite 0.2s',
                  }} />
                  <span style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
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
      </div>

      {/* Quick Replies - Floating */}
      {quickReplies.length > 0 && messages.length > 0 && !isKeyboardVisible && (
        <div style={{
          flexShrink: 0,
          padding: '8px 16px',
          paddingBottom: '4px',
          background: 'transparent',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}>
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              onClick={() => handleQuickReply(reply)}
              style={{
                padding: '6px 14px',
                fontSize: '12px',
                background: 'white',
                color: '#374151',
                borderRadius: '20px',
                border: '1px solid #e5e7eb',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'background 0.2s',
              }}
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input - Fixed at bottom */}
      <div style={{
        flexShrink: 0,
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '10px 16px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        // Prevent zoom
        touchAction: 'manipulation',
      }}>
        <form 
          onSubmit={handleSubmit} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            maxWidth: '100%',
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '10px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '24px',
              fontSize: '16px', // Prevents iOS zoom
              outline: 'none',
              minWidth: 0,
              background: '#f9fafb',
              transition: 'border-color 0.2s',
              // Prevent zoom
              touchAction: 'manipulation',
              WebkitAppearance: 'none',
            }}
            onFocus={(e) => {
              // Scroll input into view on focus
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }, 300)
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: '44px',
              height: '44px',
              background: input.trim() ? '#059669' : '#d1d5db',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              flexShrink: 0,
              transition: 'background 0.2s',
              // Prevent zoom
              touchAction: 'manipulation',
            }}
          >
            <HiPaperAirplane size={18} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </form>
        <p style={{
          fontSize: '10px',
          color: '#9ca3af',
          textAlign: 'center',
          margin: '6px 0 0 0',
        }}>
          Sakumono Assist is here to help • Responses are AI-generated
        </p>
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          .chat-page-container {
            -webkit-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }
          input[type="text"] {
            -webkit-appearance: none;
            appearance: none;
            font-size: 16px !important;
          }
          /* Prevent zoom on focus */
          input:focus {
            font-size: 16px !important;
          }
        `
      }} />
    </div>
  )
}

export default ChatPage