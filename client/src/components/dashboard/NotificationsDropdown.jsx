import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../../api/services';
import { FaBell, FaCheckDouble } from 'react-icons/fa6';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const NotificationsDropdown = ({ onClose }) => {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll().then(r => r.data.data),
  });

  const markRead = useMutation({
    mutationFn: notificationsAPI.markRead,
    onSuccess: () => qc.invalidateQueries(['notifications']),
  });

  const notifications = data?.notifications || [];
  const unread = data?.unreadCount || 0;

  return (
    <div>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">الإشعارات</h3>
          {unread > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full text-white text-center" style={{ backgroundColor: 'var(--color-primary)' }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => markRead.mutate()} className="text-xs flex items-center gap-1 opacity-60 hover:opacity-100">
            <FaCheckDouble /> تحديد الكل
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? <LoadingSpinner size="sm" /> : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FaBell className="text-3xl opacity-20" />
            <p className="text-sm opacity-50">لا توجد إشعارات</p>
          </div>
        ) : notifications.map((n) => (
          <div key={n._id} className={`px-4 py-3 border-b text-sm cursor-pointer hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}
            style={{ borderColor: 'var(--color-border)' }}>
            <p className="font-medium">{n.title}</p>
            <p className="text-xs mt-0.5 opacity-60">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDropdown;
