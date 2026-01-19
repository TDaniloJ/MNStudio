import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

import { helpCenterService } from '../../services/helpCenterService';
import { useAuthStore } from '../../store/authStore';
import HelpRequestItem from './HelpRequestItem';
import LoadingSkeleton from './LoadingSkeleton';
import EmptyState from './EmptyState';
import { socket } from '../../services/socket';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

const LIMIT = 10;

const HelpCenter = () => {
  const { isAuthenticated } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const [helpRequests, setHelpRequests] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const listRef = useRef(null);

  const fetchHelpRequests = useCallback(
    async (offset = 0) => {
      if (!isAuthenticated || loadingMore || !hasMore) return;

      try {
        offset === 0 ? setLoadingInitial(true) : setLoadingMore(true);

        const { helpRequests: data, unreadCount } =
          await helpCenterService.getHelpRequests(false, LIMIT, offset);

        setHelpRequests(prev =>
          offset === 0 ? data : [...prev, ...data]
        );
        setUnreadCount(unreadCount);

        if (data.length < LIMIT) setHasMore(false);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao carregar solicitações');
      } finally {
        setLoadingInitial(false);
        setLoadingMore(false);
      }
    },
    [isAuthenticated, loadingMore, hasMore]
  );

  /* 🔥 Load inicial */
  useEffect(() => {
    if (isAuthenticated) fetchHelpRequests(0);
  }, [fetchHelpRequests, isAuthenticated]);

  /* 🔥 Socket realtime */
  useEffect(() => {
    socket.emit('join:admin');

    socket.on('help-request:new', data => {
      setHelpRequests(prev => [data, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => socket.off('help-request:new');
  }, []);

  /* 🔥 Infinite scroll */
  const handleScroll = () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;

    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 50) {
      fetchHelpRequests(helpRequests.length);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await helpCenterService.markAllAsRead();
      setHelpRequests(prev =>
        prev.map(item => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
      toast.success('Todas marcadas como lidas');
    } catch {
      toast.error('Erro ao marcar todas');
    }
  };

  const handleMarkAsRead = async id => {
    try {
      await helpCenterService.markAsRead(id);
      setHelpRequests(prev =>
        prev.map(item =>
          item.id === id ? { ...item, is_read: true } : item
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleDelete = async id => {
    try {
      await helpCenterService.deleteHelpRequest(id);
      setHelpRequests(prev => prev.filter(item => item.id !== id));
      toast.success('Solicitação removida');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  return (
    <>
      {/* Botão */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <HelpCircle />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1.5 text-xs text-white">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-end sm:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="w-full sm:max-w-lg h-full sm:h-auto sm:rounded-2xl bg-white dark:bg-gray-900 shadow-xl flex flex-col"
            >
              {/* Header */}
              <header className="flex items-center justify-between border-b px-5 py-4 dark:border-gray-700">
                <div>
                  <h2 className="text-lg font-semibold">Central de Ajuda</h2>
                  <p className="text-sm text-gray-500">
                    {unreadCount} não lidas
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)}>✕</button>
              </header>

              {/* Lista */}
              <div
                ref={listRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto space-y-3 px-5 py-4"
              >
                {loadingInitial ? (
                  <LoadingSkeleton />
                ) : helpRequests.length > 0 ? (
                  helpRequests.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      layout
                    >
                      <HelpRequestItem
                        helpRequest={{
                          ...item,
                          timeAgo: dayjs(item.createdAt).fromNow(),
                        }}
                        onRead={handleMarkAsRead}
                        onDelete={handleDelete}
                      />
                    </motion.div>
                  ))
                ) : (
                  <EmptyState />
                )}

                {loadingMore && (
                  <p className="text-center text-sm text-gray-400">
                    Carregando mais...
                  </p>
                )}
              </div>

              {/* Footer */}
              <footer className="flex justify-between border-t px-5 py-4 dark:border-gray-700">
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-sm font-medium text-primary-600 disabled:opacity-40"
                >
                  Marcar todas como lidas
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg bg-gray-100 px-4 py-2 text-sm dark:bg-gray-800"
                >
                  Fechar
                </button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default HelpCenter;
