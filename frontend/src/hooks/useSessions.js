import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

/**
 * Hook para gerenciar sessões ativas:
 * buscar, revogar uma sessão ou revogar todas.
 */
export function useSessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authService.getActiveSessions();
      setSessions(response.sessions ?? []);
    } catch {
      toast.error('Erro ao carregar sessões');
    } finally {
      setLoading(false);
    }
  }, []);

  const revoke = async (sessionId) => {
    try {
      await authService.revokeSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success('Sessão encerrada com sucesso');
    } catch {
      toast.error('Erro ao encerrar sessão');
    }
  };

  const revokeAll = async () => {
    try {
      await authService.revokeAllSessions();
      setSessions([]);
      toast.success('Todas as sessões foram encerradas');
    } catch {
      toast.error('Erro ao encerrar sessões');
    }
  };

  return { sessions, loading, fetch, revoke, revokeAll };
}
