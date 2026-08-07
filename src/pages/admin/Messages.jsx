import React from 'react';
import { useParams } from 'react-router-dom';
import MessageInbox from '../../components/messages/MessageInbox';

const AdminMessages = () => {
  const { userId } = useParams();
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      <MessageInbox initialUserId={userId} />
    </div>
  );
};

export default AdminMessages;