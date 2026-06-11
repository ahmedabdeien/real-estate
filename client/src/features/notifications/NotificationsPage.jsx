import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { notificationsAPI } from '../../api/services';
import {
  FaBell, FaCheck, FaTrash, FaCircleInfo, FaTriangleExclamation,
  FaCircleCheck, FaCircleXmark
} from 'react-icons/fa6';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

const typeConfig = {
  info: { icon: FaCircleInfo, color: '#2563EB', bg: '#EFF6FF' },
  success: { icon: FaCircleCheck, color: '#15803D', bg: '#F0FDF4' },
  warning: { icon: FaTriangleExclamation, color: '#B45309', bg: '#FFFBEB' },
  error: { icon: FaCircleXmark, color: '#B91C1C', bg: '#FEF2F2' },
};

const formatRelative = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'منذ ثوان';
  if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
  if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
  return d.toLocaleDateString('ar-EG');
};

const NotificationsPage = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll().then(r => r.data.data),
  });

  const notifications = Array.isArray(data) ? data : (data?.notifications || []);
  const unreadCount = data?.unreadCount ?? notifications.filter(n => !n.isRead).length;

  const markAllMutation = useMutation({
    mutationFn: () => notificationsAPI.markRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsAPI.remove(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-dark)' }}>الإشعارات</h1>
          {unreadCount > 0 && (
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              لديك {unreadCount} إشعار غير مقروء
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
            className="btn btn-outline btn-sm gap-2"
          >
            <FaCheck className="text-xs" />
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<FaBell />} title="لا توجد إشعارات" description="ستظهر هنا الإشعارات الجديدة" />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type] || typeConfig.info;
            const Icon = config.icon;
            return (
              <motion.div
                key={notif._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`card p-4 flex items-start gap-4 transition-all ${!notif.isRead ? 'border-r-4' : ''}`}
                style={!notif.isRead ? { borderRightColor: config.color } : {}}
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: config.bg }}>
                  <Icon style={{ color: config.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`text-sm ${!notif.isRead ? 'font-semibold' : 'font-medium'}`}
                        style={{ color: 'var(--color-text-dark)' }}>
                        {notif.title}
                      </p>
                      {(notif.body || notif.message) && (
                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                          {notif.body || notif.message}
                        </p>
                      )}
                      {notif.link && (
                        <a href={notif.link} className="text-xs font-semibold mt-1 block"
                          style={{ color: 'var(--color-primary)' }}>
                          عرض التفاصيل
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => deleteMutation.mutate(notif._id)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 p-1"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                    {formatRelative(notif.createdAt)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
