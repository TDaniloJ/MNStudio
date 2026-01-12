import React from 'react';
import { Mail } from 'lucide-react';
import NotificationBroadcastPanel from '../../components/admin/NotificationBroadcastPanel';

const Notifications = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Mail className="w-7 h-7 text-primary-600" />
          Notificações
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gerencie e envie notificações para usuários da plataforma
        </p>
      </div>

      {/* Painel de envio */}
      <NotificationBroadcastPanel />
    </div>
  );
};

export default Notifications;
