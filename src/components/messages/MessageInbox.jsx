import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMessages } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { doctorsApi } from '../../api/doctors.api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import {
  FiSend, FiPaperclip, FiX, FiUser,
  FiCheck, FiCheckCircle, FiSearch,
  FiMoreVertical, FiTrash2, FiMessageCircle,
  FiClock, FiStar, FiUsers, FiArrowLeft
} from 'react-icons/fi';

const MessageInbox = ({ initialUserId }) => {
  const { user } = useAuth();
  const [allDoctors, setAllDoctors] = useState([]);
  const [showContactList, setShowContactList] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // ✅ Safely access context with default values
  let messagesContext = {};
  try {
    messagesContext = useMessages() || {};
  } catch (error) {
    console.warn('Message context not available:', error);
  }

  const {
    threads = [],
    currentConversation = null,
    messages = [],
    loading = false,
    isTyping = false,
    socketConnected = false,
    loadThreads = () => {},
    loadConversation = () => {},
    sendMessage = () => {},
    markAsRead = () => {},
    deleteMessage = () => {},
    setCurrentConversation = () => {}
  } = messagesContext;

  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredThreads, setFilteredThreads] = useState([]);
  const messagesEndRef = useRef(null);
  
  // Use refs to track if initial load has happened
  const initialLoadDone = useRef(false);
  const initialConversationLoaded = useRef(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ✅ Load doctors for messaging
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await doctorsApi.getAll({ limit: 100 });
        setAllDoctors(response.data.doctors || []);
      } catch (error) {
        console.error('Failed to fetch doctors:', error);
      }
    };
    fetchDoctors();
  }, []);

  // Load threads only once on mount
  useEffect(() => {
    if (user && loadThreads && typeof loadThreads === 'function' && !initialLoadDone.current) {
      initialLoadDone.current = true;
      loadThreads();
    }
  }, [user, loadThreads]);

  // Handle initialUserId - only once
  useEffect(() => {
    if (initialUserId && threads.length > 0 && !initialConversationLoaded.current) {
      const thread = threads.find(t => t.user?._id === initialUserId);
      if (thread) {
        initialConversationLoaded.current = true;
        setSelectedUser(thread.user);
        if (setCurrentConversation) {
          setCurrentConversation(thread.user);
        }
        if (loadConversation && typeof loadConversation === 'function') {
          loadConversation(initialUserId);
        }
        if (isMobile) setShowChat(true);
      } else {
        // If no thread exists, try to find the doctor
        const doctor = allDoctors.find(d => d.user?._id === initialUserId);
        if (doctor) {
          initialConversationLoaded.current = true;
          const userData = doctor.user || doctor;
          setSelectedUser({
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImage: userData.profileImage,
            role: 'doctor'
          });
          if (setCurrentConversation) {
            setCurrentConversation({
              _id: userData._id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profileImage: userData.profileImage,
              role: 'doctor'
            });
          }
          if (isMobile) setShowChat(true);
        }
      }
    }
  }, [initialUserId, threads, allDoctors, loadConversation, setCurrentConversation, isMobile]);

  // Filter threads based on search
  useEffect(() => {
    if (searchTerm) {
      // Search in threads
      const threadResults = threads.filter(thread =>
        thread.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        thread.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // Search in all doctors
      const doctorResults = allDoctors.filter(doc => {
        const userData = doc.user || doc;
        const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) && 
          !threads.some(t => t.user?._id === userData._id);
      }).map(doc => {
        const userData = doc.user || doc;
        return {
          user: {
            _id: userData._id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            profileImage: userData.profileImage,
            role: 'doctor',
            specialization: doc.specialization
          },
          isNew: true,
          lastMessage: null,
          unreadCount: 0
        };
      });
      
      setFilteredThreads([...threadResults, ...doctorResults]);
    } else {
      // Show threads first, then doctors that haven't been messaged
      const existingIds = threads.map(t => t.user?._id);
      const newDoctors = allDoctors
        .filter(doc => {
          const userData = doc.user || doc;
          return !existingIds.includes(userData._id);
        })
        .map(doc => {
          const userData = doc.user || doc;
          return {
            user: {
              _id: userData._id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              profileImage: userData.profileImage,
              role: 'doctor',
              specialization: doc.specialization
            },
            isNew: true,
            lastMessage: null,
            unreadCount: 0
          };
        });
      setFilteredThreads([...threads, ...newDoctors]);
    }
  }, [searchTerm, threads, allDoctors]);

  // Load conversation when a user is selected
  useEffect(() => {
    if (selectedUser && loadConversation && typeof loadConversation === 'function') {
      loadConversation(selectedUser._id);
    }
  }, [selectedUser?._id, loadConversation]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSelectUser = useCallback((thread) => {
    setSelectedUser(thread.user);
    if (setCurrentConversation) {
      setCurrentConversation(thread.user);
    }
    if (isMobile) setShowChat(true);
  }, [setCurrentConversation, isMobile]);

  const handleBack = useCallback(() => {
    setShowChat(false);
  }, []);

  const handleSendMessage = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) {
      toast.error('Please enter a message');
      return;
    }
    if (!selectedUser) {
      toast.error('Please select a recipient');
      return;
    }
    if (!sendMessage || typeof sendMessage !== 'function') {
      toast.error('Message service not available');
      return;
    }

    setSending(true);
    try {
      await sendMessage(selectedUser._id, newMessage, attachment);
      setNewMessage('');
      setAttachment(null);
      setAttachmentPreview(null);
      await loadThreads();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  }, [newMessage, attachment, selectedUser, sendMessage, loadThreads]);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large. Max 5MB');
        return;
      }
      setAttachment(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachmentPreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const removeAttachment = useCallback(() => {
    setAttachment(null);
    setAttachmentPreview(null);
  }, []);

  const getTimeAgo = useCallback((date) => {
    if (!date) return 'recently';
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return 'recently';
    }
  }, []);

  const getInitials = useCallback((name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, []);

  // If no user, show loading
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      {/* Left sidebar - Contacts */}
      <div className={`
        ${isMobile ? 'w-full' : 'w-80'} 
        border-r border-gray-200 flex flex-col 
        ${isMobile && showChat ? 'hidden' : 'flex'}
      `}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiMessageCircle className="text-emerald-600" />
              <span className="hidden sm:inline">Messages</span>
              <span className="sm:hidden">Chats</span>
              {threads.length > 0 && (
                <span className="text-sm bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                  {threads.length}
                </span>
              )}
            </h2>
            <button
              onClick={() => setShowContactList(!showContactList)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <FiUsers size={16} />
              <span className="hidden sm:inline">{showContactList ? 'Hide' : 'All Doctors'}</span>
            </button>
          </div>
          <div className="relative mt-3">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <div className="animate-pulse space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-gray-500 text-sm">No conversations yet</p>
              <p className="text-gray-400 text-xs mt-1">Search for a doctor to start messaging</p>
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const userData = thread.user;
              if (!userData) return null;
              
              return (
                <button
                  key={userData._id}
                  onClick={() => handleSelectUser(thread)}
                  className={`w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 text-left ${
                    selectedUser?._id === userData._id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    {userData.profileImage ? (
                      <img
                        src={userData.profileImage}
                        alt={userData.firstName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                        {getInitials(userData.firstName)}
                      </div>
                    )}
                    {thread.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                        {thread.unreadCount}
                      </span>
                    )}
                    {thread.isNew && (
                      <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {userData.role === 'doctor' ? 'Dr. ' : ''}{userData.firstName} {userData.lastName}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                        {thread.lastMessage ? getTimeAgo(thread.lastMessage.createdAt) : 'New'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500 truncate flex-1">
                        {thread.lastMessage?.content || 'No messages yet'}
                      </p>
                      {userData.specialization && (
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:inline">
                          {userData.specialization}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right - Chat area */}
      <div className={`
        flex-1 flex flex-col 
        ${isMobile && !showChat ? 'hidden' : 'flex'}
        ${isMobile ? 'absolute inset-0 bg-white z-10' : 'relative'}
      `}>
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="p-3 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-3 min-w-0">
                {isMobile && (
                  <button
                    onClick={handleBack}
                    className="p-1 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0"
                  >
                    <FiArrowLeft size={20} className="text-gray-600" />
                  </button>
                )}
                {selectedUser.profileImage ? (
                  <img
                    src={selectedUser.profileImage}
                    alt={selectedUser.firstName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-sm flex-shrink-0">
                    {getInitials(selectedUser.firstName)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {selectedUser.role === 'doctor' ? 'Dr. ' : ''}{selectedUser.firstName} {selectedUser.lastName}
                  </p>
                  <p className="text-xs text-gray-400 capitalize truncate">{selectedUser.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isTyping && (
                  <span className="text-xs text-emerald-600 animate-pulse hidden sm:inline">typing...</span>
                )}
                {socketConnected && (
                  <span className="w-2 h-2 bg-green-400 rounded-full" />
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💬</div>
                  <p className="text-gray-400 text-sm">No messages yet</p>
                  <p className="text-gray-300 text-xs mt-1">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMine = message.sender?._id === user?._id;
                  return (
                    <div
                      key={message._id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] sm:max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                        <div
                          className={`rounded-2xl px-3 py-2 sm:px-4 sm:py-2 ${
                            isMine
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white text-gray-800 border border-gray-200'
                          }`}
                        >
                          {message.attachment && (
                            <div className="mb-2">
                              {message.attachment.mimeType?.startsWith('image/') ? (
                                <img
                                  src={message.attachment.url}
                                  alt="Attachment"
                                  className="max-w-full rounded-lg max-h-40 sm:max-h-60"
                                />
                              ) : (
                                <a
                                  href={message.attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm underline"
                                >
                                  📎 {message.attachment.fileName}
                                </a>
                              )}
                            </div>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-xs text-gray-400 ${isMine ? 'justify-end' : 'justify-start'}`}>
                          <span>{getTimeAgo(message.createdAt)}</span>
                          {isMine && (
                            <span>
                              {message.isRead ? (
                                <FiCheckCircle className="text-emerald-500" size={12} />
                              ) : (
                                <FiCheck className="text-gray-400" size={12} />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            <div className="p-2 sm:p-3 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 flex-shrink-0"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  <FiPaperclip size={18} className="sm:size-20" />
                </button>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex-1 relative">
                  {attachmentPreview && (
                    <div className="relative inline-block mb-2">
                      <img
                        src={attachmentPreview}
                        alt="Attachment preview"
                        className="h-12 w-12 sm:h-16 sm:w-16 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                    rows="1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || (!newMessage.trim() && !attachment)}
                  className="p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <FiSend size={18} className="sm:size-20" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4 sm:p-8">
            <div>
              <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">💬</div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Select a conversation</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Choose a doctor from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInbox;