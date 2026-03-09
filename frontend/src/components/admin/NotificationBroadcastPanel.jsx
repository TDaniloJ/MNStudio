import React, { useState } from 'react';
import { Send, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/userEnhancementService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const NotificationBroadcastPanel = () => {
  const [loading, setLoading] = useState(false);

  const [notificationType, setNotificationType] = useState('system');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionUrl, setActionUrl] = useState('');

  const handleSendNotification = async (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      toast.error('Título e mensagem são obrigatórios');
      return;
    }

    try {
      setLoading(true);

      await notificationService.broadcastNotification({
        send_to_all: true, // ✅ aqui
        type: notificationType,
        title: title.trim(),
        message: message.trim(),
        action_url: actionUrl.trim() || null
      });

      toast.success('Notificação enviada para TODOS os usuários');

      setTitle('');
      setMessage('');
      setActionUrl('');
      setNotificationType('system');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao enviar notificação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
          <Mail className="w-6 h-6 text-primary-600" />
          Enviar Notificação em Massa
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Envie notificações para todos os usuários simultaneamente
        </p>
      </div>

      <form onSubmit={handleSendNotification} className="space-y-6">
        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Notificação
          </label>
          <select
            value={notificationType}
            onChange={(e) => setNotificationType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="system">🔧 Sistema</option>
            <option value="admin">👑 Administrativo</option>
            <option value="favorite_update">❤️ Atualização de Favorito</option>
          </select>
        </div>

        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Título
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da notificação"
            maxLength={255}
            required
          />
        </div>

        {/* Mensagem */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mensagem
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Conteúdo da notificação"
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            rows="5"
            required
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL de Ação (Opcional)
          </label>
          <Input
            value={actionUrl}
            onChange={(e) => setActionUrl(e.target.value)}
            placeholder="/mangas/123 ou /novels/456"
            type="text"
          />
        </div>

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="reset"
            variant="secondary"
            onClick={() => {
              setTitle('');
              setMessage('');
              setActionUrl('');
              setNotificationType('system');
            }}
          >
            Limpar
          </Button>

          <Button type="submit" loading={loading} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Enviar para Todos
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NotificationBroadcastPanel;
