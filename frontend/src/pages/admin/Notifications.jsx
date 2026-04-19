import React, { useState } from 'react';
import { Mail, Bell, Send, Users, Clock, CheckCircle } from 'lucide-react';
import NotificationBroadcastPanel from '../../components/admin/NotificationBroadcastPanel';
import Card from '../../components/common/Card';

const RECENT_NOTIFICATIONS = [
  { id: 1, title: 'Novo capítulo disponível', target: 'Todos os usuários', sentAt: '2 horas atrás', status: 'sent', count: 1243 },
  { id: 2, title: 'Manutenção programada',    target: 'Todos os usuários', sentAt: '1 dia atrás',   status: 'sent', count: 1180 },
  { id: 3, title: 'Novidade: Sistema de coins', target: 'Premium',         sentAt: '3 dias atrás',  status: 'sent', count: 342  },
];

const Notifications = () => {
  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-xl">
            <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Notificações</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
          Gerencie e envie notificações para usuários da plataforma
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Send,  label: 'Enviadas hoje',       value: '3',    color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20'   },
          { icon: Users, label: 'Usuários alcançados',  value: '2.7k', color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20' },
          { icon: Bell,  label: 'Taxa de abertura',     value: '68%',  color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-xl flex-shrink-0 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-xl font-black ${color}`}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Painel de envio */}
      <NotificationBroadcastPanel />

      {/* Histórico recente */}
      <Card className="p-5">
        <h2 className="text-base font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Histórico Recente
        </h2>
        <div className="space-y-2">
          {RECENT_NOTIFICATIONS.map((n) => (
            <div key={n.id}
              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{n.title}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{n.target} · {n.sentAt}</p>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{n.count.toLocaleString()}</p>
                <p className="text-xs text-gray-400">entregues</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Notifications;