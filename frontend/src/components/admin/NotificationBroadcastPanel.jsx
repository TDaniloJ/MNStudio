import React, { useState } from 'react';
import { Send, Mail, Users, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/userEnhancementService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const NOTIFICATION_TYPES = [
  { value: 'system',          label: '🔧 Sistema',               desc: 'Avisos técnicos e manutenções'         },
  { value: 'admin',           label: '👑 Administrativo',         desc: 'Comunicados oficiais da equipe'        },
  { value: 'favorite_update', label: '❤️ Atualização de Favorito', desc: 'Novos capítulos de obras favoritas'   },
];

const NotificationBroadcastPanel = () => {
  const [loading,           setLoading]           = useState(false);
  const [notificationType,  setNotificationType]  = useState('system');
  const [title,             setTitle]             = useState('');
  const [message,           setMessage]           = useState('');
  const [actionUrl,         setActionUrl]         = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) { toast.error('Título e mensagem são obrigatórios'); return; }
    setLoading(true);
    try {
      await notificationService.broadcastNotification({
        send_to_all: true,
        type:        notificationType,
        title:       title.trim(),
        message:     message.trim(),
        action_url:  actionUrl.trim() || null,
      });
      toast.success('Notificação enviada para todos os usuários!');
      setTitle('');
      setMessage('');
      setActionUrl('');
      setNotificationType('system');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao enviar notificação');
    } finally { setLoading(false); }
  };

  const selectedType = NOTIFICATION_TYPES.find((t) => t.value === notificationType);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-gray-100 dark:border-gray-800">
        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
          <Mail className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h2 className="text-base font-black text-gray-900 dark:text-white">Enviar Notificação em Massa</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
            <Users className="w-3 h-3" />
            Será enviada para todos os usuários simultaneamente
          </p>
        </div>
      </div>

      <form onSubmit={handleSend} className="space-y-5">

        {/* Tipo de notificação */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">
            Tipo de Notificação
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {NOTIFICATION_TYPES.map(({ value, label, desc }) => (
              <button key={value} type="button" onClick={() => setNotificationType(value)}
                className={`flex flex-col items-start gap-1 px-4 py-3 rounded-xl border text-left transition-all ${
                  notificationType === value
                    ? 'border-primary-400 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{label}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Preview do tipo selecionado */}
        {selectedType && (
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
            <Zap className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tipo selecionado: <strong className="text-gray-900 dark:text-white">{selectedType.label}</strong> — {selectedType.desc}
            </p>
          </div>
        )}

        {/* Título */}
        <Input label="Título *" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Nova funcionalidade disponível" maxLength={255} required />

        {/* Mensagem */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">
            Mensagem *
          </label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Conteúdo completo da notificação…" maxLength={1000} rows={4} required
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none transition-all" />
          <p className="text-right text-[10px] text-gray-400 dark:text-gray-500 mt-1">{message.length}/1000</p>
        </div>

        {/* URL de ação */}
        <Input label="URL de Ação (opcional)" value={actionUrl} onChange={(e) => setActionUrl(e.target.value)}
          placeholder="Ex: /mangas/123 ou /subscription" />

        {/* Ações */}
        <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
          <button type="button" onClick={() => { setTitle(''); setMessage(''); setActionUrl(''); setNotificationType('system'); }}
            className="px-4 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Limpar
          </button>
          <Button type="submit" loading={loading}>
            <Send className="w-4 h-4 mr-2" />
            Enviar para Todos
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NotificationBroadcastPanel;