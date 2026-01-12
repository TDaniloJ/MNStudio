import React, { useState, useEffect } from 'react';
import { Send, Users, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { notificationService } from '../../services/userEnhancementService';
import Card from '../common/Card';
import Button from '../common/Button';
import Input from '../common/Input';

const NotificationBroadcastPanel = () => {
  const [loading, setLoading] = useState(false);
  const [userIds, setUserIds] = useState('');
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

      const ids = userIds
        .split(',')
        .map(id => parseInt(id.trim()))
        .filter(id => !isNaN(id));

      if (ids.length === 0) {
        toast.error('Insira pelo menos um ID de usuário');
        return;
      }

      await notificationService.broadcastNotification({
        user_ids: ids,
        type: notificationType,
        title: title.trim(),
        message: message.trim(),
        action_url: actionUrl.trim() || null
      });

      toast.success(`Notificação enviada para ${ids.length} usuário(s)`);
      
      // Reset form
      setUserIds('');
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
          Envie notificações para múltiplos usuários simultaneamente
        </p>
      </div>

      <form onSubmit={handleSendNotification} className="space-y-6">
        {/* IDs de Usuários */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IDs de Usuários
          </label>
          <textarea
            value={userIds}
            onChange={(e) => setUserIds(e.target.value)}
            placeholder="Insira os IDs separados por vírgula (ex: 1, 2, 3, 4)"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            rows="3"
            required
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Separe múltiplos IDs com vírgulas
          </p>
        </div>

        {/* Tipo de Notificação */}
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {title.length}/255 caracteres
          </p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {message.length}/1000 caracteres
          </p>
        </div>

        {/* URL de Ação (Opcional) */}
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            URL para redirecionar ao clicar na notificação (deixe em branco para desabilitar)
          </p>
        </div>

        {/* Preview */}
        {title || message ? (
          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800 rounded-lg">
            <p className="text-xs font-medium text-primary-800 dark:text-primary-300 mb-2">
              Preview da Notificação
            </p>
            <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                {title || '(Sem título)'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                {message || '(Sem mensagem)'}
              </p>
            </div>
          </div>
        ) : null}

        {/* Botões */}
        <div className="flex gap-3 pt-4 border-t">
          <Button
            type="reset"
            variant="secondary"
            onClick={() => {
              setUserIds('');
              setTitle('');
              setMessage('');
              setActionUrl('');
              setNotificationType('system');
            }}
          >
            Limpar Formulário
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!userIds.trim() || !title.trim() || !message.trim()}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Enviar Notificação
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default NotificationBroadcastPanel;
