// pages/Messages.jsx
import React from 'react';
import MessageInbox from '../components/messages/MessageInbox';

const Messages = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <MessageInbox />
    </div>
  );
};

export default Messages;