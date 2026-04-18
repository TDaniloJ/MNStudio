import React from 'react';
import { Monitor } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * Aba de sessões ativas: lista e revogação de sessões.
 */
const SessionsTab = ({ sessions, loadingSessions, onRevoke, onRevokeAll }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sessões Ativas</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Gerencie suas sessões em diferentes dispositivos
        </p>
      </div>
      <Button variant="danger" onClick={onRevokeAll} disabled={sessions.length <= 1}>
        Encerrar Todas as Outras Sessões
      </Button>
    </div>

    {loadingSessions ? (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" />
        <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando sessões...</p>
      </div>
    ) : sessions.length === 0 ? (
      <p className="text-gray-600 dark:text-gray-400 py-4">Nenhuma sessão ativa encontrada.</p>
    ) : (
      <div className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{session.device}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {session.browser} · {session.location}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Última atividade:{' '}
                  {new Date(session.last_activity).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {session.current ? (
                <span className="px-3 py-1 text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                  Esta sessão
                </span>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => onRevoke(session.id)}>
                  Encerrar
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </Card>
);

export default SessionsTab;
