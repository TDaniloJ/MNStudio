import React, { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/userEnhancementService';
import { useAuthStore } from '../../store/authStore';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();

    useEffect(() => {
    if (!isAuthenticated) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
    }, [isAuthenticated]);

    const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
        const data = await notificationService.getNotifications(false, 10);
        setNotifications(data.notifications || []);
        setUnreadCount(data.unread_count || 0);
    } catch (error) {
        if (error.response?.status !== 401) {
        console.error('Erro ao buscar notificações:', error);
        }
    }
    };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read_at: new Date() } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Erro ao marcar como lido');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setLoading(true);
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date() }))
      );
      setUnreadCount(0);
      toast.success('Todas as notificações marcadas como lidas');
    } catch (error) {
      toast.error('Erro ao marcar todas como lidas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notificação deletada');
    } catch (error) {
      toast.error('Erro ao deletar notificação');
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'favorite_update':
        return 'bg-red-50 dark:bg-red-900/20';
      case 'system':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'admin':
        return 'bg-purple-50 dark:bg-purple-900/20';
      default:
        return 'bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'favorite_update':
        return '❤️';
      case 'system':
        return '⚙️';
      case 'admin':
        return '👑';
      default:
        return '📢';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => {
            if (!isAuthenticated) {
                toast.error('Faça login para ver notificações');
                return;
            }
            setIsOpen(!isOpen);
        }}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
      >
        <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl dark:shadow-gray-900/50 z-40 border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={loading}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Notificações */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Sem notificações</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition ${
                      !notification.read_at ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                    } ${getNotificationColor(notification.type)}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 text-xl">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2">
                            {notification.title}
                          </p>
                          {!notification.read_at && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="flex-shrink-0 text-primary-600 dark:text-primary-400 hover:text-primary-700"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-center">
                <a
                  href="/notifications"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700"
                >
                  Ver todas
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationCenter;
