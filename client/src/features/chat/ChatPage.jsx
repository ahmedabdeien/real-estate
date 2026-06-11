import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaPaperPlane, FaMagnifyingGlass, FaCircle, FaUser, FaEllipsisVertical
} from 'react-icons/fa6';
import api from '../../api/axios';
import { getSocket } from '../../hooks/useSocket';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return 'اليوم';
  if (diff === 1) return 'أمس';
  return d.toLocaleDateString('ar-EG');
};

const Avatar = ({ name, size = 10, online }) => (
  <div className="relative flex-shrink-0">
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-sm`}
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {name?.charAt(0)}
    </div>
    {online !== undefined && (
      <span className={`absolute bottom-0 left-0 w-2.5 h-2.5 rounded-full border-2 border-white ${online ? 'bg-green-500' : 'bg-gray-300'}`} />
    )}
  </div>
);

const ChatPage = () => {
  const { user, token } = useSelector(s => s.auth);
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [onlineUsers, setOnlineUsers] = useState({});
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = getSocket();

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['chatUsers'],
    queryFn: () => api.get('/chat/users').then(r => r.data.data),
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => api.get('/chat/conversations').then(r => r.data.data),
    refetchInterval: 10000,
  });

  const loadMessages = useCallback(async (partnerId) => {
    setLoading(true);
    try {
      const res = await api.get(`/chat/${partnerId}`);
      setMessages(res.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUser) loadMessages(selectedUser._id);
  }, [selectedUser, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('chat:receive', (msg) => {
      if (selectedUser && (msg.senderId._id === selectedUser._id || msg.senderId === selectedUser._id)) {
        setMessages(prev => [...prev, msg]);
        socket.emit('chat:read', { senderId: selectedUser._id });
      }
      queryClient.invalidateQueries(['conversations']);
    });

    socket.on('chat:sent', (msg) => {
      setMessages(prev => {
        const exists = prev.find(m => m._id === msg._id);
        if (exists) return prev;
        return [...prev, msg];
      });
    });

    socket.on('user:online', ({ userId }) => setOnlineUsers(prev => ({ ...prev, [userId]: true })));
    socket.on('user:offline', ({ userId }) => setOnlineUsers(prev => ({ ...prev, [userId]: false })));

    return () => {
      socket.off('chat:receive');
      socket.off('chat:sent');
      socket.off('user:online');
      socket.off('user:offline');
    };
  }, [socket, selectedUser, queryClient]);

  const handleSend = () => {
    if (!input.trim() || !selectedUser || !socket) return;
    const text = input.trim();
    setInput('');
    socket.emit('chat:send', { receiverId: selectedUser._id, message: text });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filteredUsers = users.filter(u => u.name.includes(search));

  const getUnread = (userId) => {
    const conv = conversations.find(c => c._id?._id?.toString() === userId || c._id?.toString() === userId);
    return conv?.unreadCount || 0;
  };

  return (
    <div className="flex h-[calc(100vh-130px)] rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
      {/* Sidebar list */}
      <div className="w-72 flex-shrink-0 border-l flex flex-col" style={{ backgroundColor: '#fff', borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h2 className="text-base font-bold mb-3" style={{ color: 'var(--color-text-dark)' }}>الرسائل</h2>
          <div className="relative">
            <FaMagnifyingGlass className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--color-text-muted)' }} />
            <input
              className="input pr-8 text-sm py-1.5"
              placeholder="بحث..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {usersLoading ? (
            <div className="flex justify-center py-8"><LoadingSpinner /></div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>لا يوجد مستخدمون</p>
          ) : (
            filteredUsers.map(u => {
              const isSelected = selectedUser?._id === u._id;
              const isOnline = onlineUsers[u._id] ?? u.isOnline;
              const unread = getUnread(u._id);
              return (
                <button
                  key={u._id}
                  onClick={() => { setSelectedUser(u); setMessages([]); }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-right transition-colors"
                  style={{
                    backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-primary) 8%, transparent)' : 'transparent',
                    borderRight: isSelected ? '3px solid var(--color-primary)' : '3px solid transparent',
                  }}
                >
                  <Avatar name={u.name} online={isOnline} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate" style={{ color: isSelected ? 'var(--color-primary)' : 'var(--color-text-dark)' }}>
                        {u.name}
                      </span>
                      {unread > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold"
                          style={{ backgroundColor: 'var(--color-primary)' }}>
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                      {isOnline ? 'متصل الآن' : 'غير متصل'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col" style={{ backgroundColor: '#fcfcfc' }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3 border-b bg-white" style={{ borderColor: 'var(--color-border)' }}>
            <Avatar name={selectedUser.name} online={onlineUsers[selectedUser._id] ?? selectedUser.isOnline} />
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--color-text-dark)' }}>{selectedUser.name}</p>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {(onlineUsers[selectedUser._id] ?? selectedUser.isOnline) ? 'متصل الآن' : 'غير متصل'}
              </p>
            </div>
            <button className="mr-auto btn btn-ghost btn-icon btn-sm">
              <FaEllipsisVertical />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {loading ? (
              <div className="flex justify-center py-8"><LoadingSpinner /></div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--color-text-muted)' }}>
                <FaUser className="text-5xl mb-3 opacity-30" />
                <p className="text-sm">ابدأ المحادثة مع {selectedUser.name}</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMe = (msg.senderId?._id || msg.senderId)?.toString() === user._id;
                return (
                  <motion.div
                    key={msg._id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md group`}>
                      <div
                        className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm"
                        style={isMe ? {
                          backgroundColor: 'var(--color-primary)',
                          color: '#fff',
                          borderBottomRightRadius: '4px',
                        } : {
                          backgroundColor: '#fff',
                          color: 'var(--color-text-dark)',
                          border: '1px solid var(--color-border)',
                          borderBottomLeftRadius: '4px',
                        }}
                      >
                        {msg.message}
                      </div>
                      <p className={`text-xs mt-1 px-1 opacity-60 ${isMe ? 'text-right' : 'text-left'}`}>
                        {formatTime(msg.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white px-4 py-3" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-end gap-3">
              <textarea
                className="input flex-1 resize-none text-sm"
                rows={1}
                placeholder="اكتب رسالة..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="btn-primary btn p-3 flex-shrink-0"
                style={{ borderRadius: '50%' }}
              >
                <FaPaperPlane className="text-sm" />
              </button>
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>اضغط Enter للإرسال</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center" style={{ backgroundColor: '#fcfcfc' }}>
          <div className="text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center opacity-20"
              style={{ backgroundColor: 'var(--color-primary)' }}>
              <FaPaperPlane className="text-4xl text-white" />
            </div>
            <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--color-text-dark)' }}>الرسائل الداخلية</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>اختر محادثة من القائمة لبدء المراسلة</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
