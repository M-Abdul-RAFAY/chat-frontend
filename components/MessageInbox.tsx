"use client";

import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Send, Mic } from 'lucide-react';
import { useState, useEffect } from 'react';

interface MessageInboxProps {
  platform: 'facebook' | 'instagram' | 'whatsapp';
  conversationId: string | null;
  onBack: () => void;
  isMobile?: boolean;
}

interface FacebookMessage {
  id: string;
  message: string;
  from: { name: string; id: string };
  created_time: string;
}

interface InstagramComment {
  text: string;
  username: string;
  timestamp: string;
}

// Mock messages data
const mockMessages: Record<string, any[]> = {
  '1': [
    {
      id: 1,
      text: "Hey! How's your day going?",
      sender: 'other',
      timestamp: '2:25 PM',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    },
    {
      id: 2,
      text: "Pretty good! Just finished a big project at work. How about you?",
      sender: 'me',
      timestamp: '2:27 PM',
      status: 'read',
    },
    {
      id: 3,
      text: "That's awesome! I've been planning this dinner for weeks 😄",
      sender: 'other',
      timestamp: '2:28 PM',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    },
    {
      id: 4,
      text: "Are we still on for dinner tonight?",
      sender: 'other',
      timestamp: '2:30 PM',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    },
  ],
  '7': [
    {
      id: 1,
      text: "Your Iceland photos are incredible! 📸",
      sender: 'other',
      timestamp: '4:15 PM',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    },
    {
      id: 2,
      text: "Thank you! It was an amazing trip. The Northern Lights were spectacular.",
      sender: 'me',
      timestamp: '4:17 PM',
      status: 'read',
    },
    {
      id: 3,
      text: "I'm so jealous! How long were you there?",
      sender: 'other',
      timestamp: '4:18 PM',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    },
    {
      id: 4,
      text: "Amazing shots from your Iceland trip! 📸",
      sender: 'other',
      timestamp: '4:20 PM',
      avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
    },
  ],
};

const conversationDetails: Record<string, any> = {
  '1': {
    name: 'Sarah Wilson',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    status: 'Online',
  },
  '7': {
    name: 'travel_photographer',
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    status: 'Active 5 min ago',
  },
};

export default function MessageInbox({ platform, conversationId, onBack, isMobile }: MessageInboxProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (conversationId && platform !== "whatsapp") {
      fetchMessages();
    }
  }, [conversationId, platform]);

  const fetchMessages = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (platform === "facebook") {
        const response = await fetch("http://localhost:4000/facebook/messages");
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          const conversation = data.data?.find((conv: any) => conv.id === conversationId);
          if (conversation?.messages?.data) {
            const formattedMessages = conversation.messages.data.map((msg: FacebookMessage, index: number) => ({
              id: index,
              text: msg.message,
              sender: 'other',
              timestamp: new Date(msg.created_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
            }));
            setMessages(formattedMessages);
          }
        }
      } else if (platform === "instagram") {
        const response = await fetch("http://localhost:4000/instagram/comments");
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          const post = data.data?.find((p: any) => p.id === conversationId);
          if (post?.comments) {
            const formattedMessages = post.comments.map((comment: InstagramComment, index: number) => ({
              id: index,
              text: comment.text,
              sender: 'other',
              timestamp: new Date(comment.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
              avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop',
            }));
            setMessages(formattedMessages);
          }
        }
      }
    } catch (err) {
      setError("Failed to fetch messages");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
          <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  // Use real data or fallback to mock data for WhatsApp
  const displayMessages = platform === "whatsapp" ? (mockMessages[conversationId] || []) : messages;
  const conversation = platform === "whatsapp" ? conversationDetails[conversationId] : {
    name: platform === "facebook" ? `Facebook Conversation` : `Instagram Post`,
    avatar: platform === "facebook" ? 
      'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop' :
      'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
    status: platform === "facebook" ? 'Facebook Page' : 'Instagram Business',
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'whatsapp': return 'bg-green-500';
      case 'facebook': return 'bg-blue-600';
      case 'instagram': return 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-400';
      default: return 'bg-gray-500';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, you would send the message to your backend
      setNewMessage('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 ${getPlatformColor(platform)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button
                onClick={onBack}
                className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <img
              src={conversation?.avatar}
              alt={conversation?.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-medium text-white">{conversation?.name}</h3>
              <p className="text-sm text-white/80">{conversation?.status}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <Phone size={18} />
            </button>
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <Video size={18} />
            </button>
            <button className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {displayMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${
              message.sender === 'me' ? 'flex-row-reverse space-x-reverse' : ''
            }`}>
              {message.sender === 'other' && (
                <img
                  src={message.avatar}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              )}
              
              <div className={`px-4 py-2 rounded-2xl ${
                message.sender === 'me'
                  ? `text-white ${
                      platform === 'whatsapp' ? 'bg-green-500' :
                      platform === 'facebook' ? 'bg-blue-600' : 'bg-pink-500'
                    }`
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <p className="text-sm">{message.text}</p>
                <div className={`flex items-center justify-end mt-1 space-x-1 ${
                  message.sender === 'me' ? 'text-white/70' : 'text-gray-500'
                }`}>
                  <span className="text-xs">{message.timestamp}</span>
                  {message.sender === 'me' && message.status === 'read' && (
                    <div className="flex space-x-0.5">
                      <div className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <div className="w-3 h-3 rounded-full bg-white/30 flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip size={20} />
          </button>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
              <Smile size={18} />
            </button>
          </div>
          
          {newMessage.trim() ? (
            <button
              onClick={handleSendMessage}
              className={`p-3 rounded-full text-white transition-colors ${
                platform === 'whatsapp' ? 'bg-green-500 hover:bg-green-600' :
                platform === 'facebook' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'
              }`}
            >
              <Send size={18} />
            </button>
          ) : (
            <button className="text-gray-400 hover:text-gray-600 transition-colors p-3">
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}