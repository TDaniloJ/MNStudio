import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';
import { useNavigate } from 'react-router-dom';

import { notificationService } from '../services/userEnhancementService';
import { useAuthStore } from '../store/authStore';
import { socket } from '../services/socket';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const Notifications = () => {
  const { isAuthenticated, user } = useAuthStore();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [page, setPage] = useState(0);
  const limit = 15;

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const navigate = useNavigate();

  const fetchPage = useCallback(async (pageToLoad = 0) => {
    if (!isAuthenticated) return;

    try {
      if (pageToLoad === 0) setLoading(true);
      else setLoadingMore(true);

      const data = await notificationService.getNotifications(false, limit, pageToLoad);

      const newItems = data.notifications || [];
      const totalUnread = data.unread_count || 0;

      setUnreadCount(totalUnread);

      if (pageToLoad === 0) {
        setNotifications(newItems);
      } else {
        setNotifications((prev) => [...prev, ...newItems]);
      }

      setHasMore(newItems.length === limit);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchPage(0);
  }, [isAuthenticated, fetchPage]);

  // realtime
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    socket.emit('join:user', user.id);

    return () => {
      socket.emit('leave:user', user.id); // 🔥 evita vazamento
    };
  }, [isAuthenticated, user?.id]);

  const handleLoadMore = async () => {
    if (!hasMore || loadingMore) return;

    const next = page + 1;
    setPage(next);
    await fetchPage(next);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);

      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date() } : n))
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date() })));
      setUnreadCount(0);

      toast.success('Todas marcadas como lidas');
    } catch {
      toast.error('Erro ao marcar todas');
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notificação removida');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '📢';
    }
  };

  const formatTime = (date) => {
    const d = dayjs(date);
    if (dayjs().diff(d, 'day') > 7) {
      return d.format('DD/MM/YYYY');
    }
    return d.fromNow();
  };

  if (!isAuthenticated) {
    return (
      <div className="container-custom py-10">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center bg-white dark:bg-gray-900">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-60" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Notificações
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Faça login para ver suas notificações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notificações
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {unreadCount} não lidas
          </p>
        </div>

        <button
          onClick={handleMarkAllAsRead}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium"
        >
          <CheckCheck className="w-4 h-4" />
          Marcar todas
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
        {loading ? (
          <div className="p-6 text-gray-500">Carregando...</div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Nenhuma notificação ainda.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-4 flex items-start gap-3 ${
                  !n.read_at ? 'bg-primary-50 dark:bg-primary-900/10' : ''
                }`}
              >
                <div className="text-xl mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {n.title}
                    </p>

                    {!n.read_at && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Marcar como lida"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {n.message}
                  </p>

                  <p className="text-xs text-gray-500 mt-2">
                    {formatTime(n.created_at)}
                  </p>

                  {n.action_url && (
                    <button
                      onClick={() => navigate(n.action_url)}
                      className="inline-block mt-2 text-sm text-primary-600 hover:underline"
                    >
                      Abrir
                    </button>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (confirm('Deseja remover esta notificação?')) {
                      handleDelete(n.id);
                    }
                  }}
                  className="text-gray-400 hover:text-red-600 transition"
                  title="Excluir"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {hasMore && !loading && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="rounded-lg px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium disabled:opacity-50"
          >
            {loadingMore ? 'Carregando...' : 'Carregar mais'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;
