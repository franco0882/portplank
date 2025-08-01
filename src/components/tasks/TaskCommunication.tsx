import React, { useState, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Communication } from '../../types/database';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../contexts/AuthContext';

interface TaskCommunicationProps {
  taskId: string;
}

export const TaskCommunication: React.FC<TaskCommunicationProps> = ({ taskId }) => {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState<Communication[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // In a real app, fetch messages from Supabase
    // For now, we'll use mock data
    setMessages([
      {
        id: '1',
        task_id: taskId,
        sender_id: 'user1',
        message: 'I need some clarification on this task. What exactly should I include in the video?',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        task_id: taskId,
        sender_id: 'user2',
        message: 'Please include a brief introduction of yourself and your business goals. Keep it under 2 minutes.',
        created_at: new Date(Date.now() - 43200000).toISOString(),
      },
    ]);
  }, [taskId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userProfile) return;

    setSending(true);
    try {
      const message: Communication = {
        id: Date.now().toString(),
        task_id: taskId,
        sender_id: userProfile.id,
        message: newMessage,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Messages</h4>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === userProfile?.id;
          return (
            <div
              key={message.id}
              className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <Avatar
                src=""
                alt="User"
                size="sm"
              />
              <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                <div
                  className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.message}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={Paperclip}
        >
        </Button>
        <Button
          type="submit"
          size="sm"
          icon={Send}
          loading={sending}
          disabled={!newMessage.trim()}
        >
        </Button>
      </form>
    </div>
  );
};