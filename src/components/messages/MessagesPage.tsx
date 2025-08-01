import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { DatabaseService } from '../../lib/database';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const MessagesPage: React.FC = () => {
  const { userProfile } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, [userProfile]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // In a real implementation, you'd fetch conversations based on user role
      // For now, we'll use mock data
      const mockConversations = [
        {
          id: 'conv1',
          taskId: 'task1',
          taskTitle: 'Create Facebook Business Account',
          clientName: 'John Smith',
          lastMessage: 'I need help with this task',
          lastMessageTime: new Date(Date.now() - 3600000).toISOString(),
          unreadCount: 2,
        },
        {
          id: 'conv2',
          taskId: 'task2',
          taskTitle: 'Upload Brand Assets',
          clientName: 'Sarah Johnson',
          lastMessage: 'Files uploaded successfully',
          lastMessageTime: new Date(Date.now() - 7200000).toISOString(),
          unreadCount: 0,
        },
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (taskId: string) => {
    try {
      const data = await DatabaseService.getCommunications(taskId);
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !userProfile) return;

    setSending(true);
    try {
      const message = await DatabaseService.createCommunication({
        task_id: selectedConversation,
        sender_id: userProfile.id,
        message: newMessage,
      });

      setMessages(prev => [...prev, message]);
      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (taskId: string) => {
    setSelectedConversation(taskId);
    fetchMessages(taskId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation.taskId)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation === conversation.taskId ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <Avatar src="" alt={conversation.clientName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.clientName}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">{conversation.taskTitle}</p>
                  <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(conversation.lastMessageTime).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Messages Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center space-x-3">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {conversations.find(c => c.taskId === selectedConversation)?.taskTitle}
                  </h3>
                  <p className="text-sm text-gray-600">
                    with {conversations.find(c => c.taskId === selectedConversation)?.clientName}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === userProfile?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <Avatar
                      src={message.users?.avatar_url}
                      alt={message.users?.full_name || 'User'}
                      size="sm"
                    />
                    <div className={`flex-1 max-w-xs lg:max-w-md ${isOwnMessage ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block px-4 py-2 rounded-lg text-sm ${
                          isOwnMessage
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
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

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button
                  type="submit"
                  icon={Send}
                  loading={sending}
                  disabled={!newMessage.trim()}
                >
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};