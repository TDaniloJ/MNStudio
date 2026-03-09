import { createContext, useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { socket } from '../services/socket';
import { useAuthStore } from '../store/authStore';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onNewNotification = (data) => {
      setNotifications(prev => [data, ...prev]);

      toast.custom(t => (
        <div className={`rounded-xl bg-gray-900 text-white px-4 py-3 shadow-lg ${t.visible ? 'animate-in slide-in-from-right' : 'animate-out fade-out'}`}>
          <p className="font-semibold">{data.title}</p>
          <p className="text-sm text-gray-300">{data.message}</p>
        </div>
      ));
    };

    socket.on('notification:new', onNewNotification);

    return () => {
      socket.off('notification:new', onNewNotification);
    };
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ notifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
