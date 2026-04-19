import React, { useState, useEffect } from 'react';
import {
  HelpCircle, Search, MessageSquare, Clock, CheckCircle,
  AlertCircle, XCircle, ChevronRight, User, Tag, Filter,
  RefreshCw, Eye, Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Loading from '../../components/common/Loading';

/* ── Mock service (substitua pelo seu supportService) ────────────── */

const MOCK_TICKETS = [
  { id: 1, subject: 'Não consigo acessar minha conta',   user: 'ana_silva',   status: 'open',        priority: 'high',   category: 'account', createdAt: '2025-04-19T10:30:00', messages: [{ from: 'user', text: 'Minha conta está bloqueada e não consigo recuperar a senha.', at: '10:30' }] },
  { id: 2, subject: 'Capítulo não carrega corretamente', user: 'leitor99',    status: 'in_progress', priority: 'medium', category: 'content', createdAt: '2025-04-19T09:15:00', messages: [{ from: 'user', text: 'O capítulo 45 do mangá X fica em loop de carregamento.', at: '09:15' }, { from: 'admin', text: 'Olá, estamos verificando o problema. Poderia nos informar o nome exato do mangá?', at: '09:40' }] },
  { id: 3, subject: 'Cobrança indevida no plano premium', user: 'joao_leitor', status: 'open',       priority: 'high',   category: 'billing', createdAt: '2025-04-18T16:00:00', messages: [{ from: 'user', text: 'Fui cobrado duas vezes no mesmo mês.', at: '16:00' }] },
  { id: 4, subject: 'Sugestão: tema escuro melhorado',   user: 'night_owl',   status: 'closed',      priority: 'low',    category: 'feedback', createdAt: '2025-04-17T14:20:00', messages: [{ from: 'user', text: 'Seria ótimo ter um modo noturno mais escuro.', at: '14:20' }, { from: 'admin', text: 'Obrigado pela sugestão! Adicionamos ao roadmap.', at: '14:50' }] },
  { id: 5, subject: 'Não recebo emails de notificação',  user: 'maria_w',     status: 'in_progress', priority: 'medium', category: 'account', createdAt: '2025-04-17T11:00:00', messages: [{ from: 'user', text: 'Desde ontem não recebo nenhum email do site.', at: '11:00' }] },
];

const STATUS_CONFIG = {
  open:        { label: 'Aberto',       icon: AlertCircle,  color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800'    },
  in_progress: { label: 'Em Análise',   icon: Clock,        color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800' },
  closed:      { label: 'Resolvido',    icon: CheckCircle,  color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800' },
};

const PRIORITY_CONFIG = {
  high:   { label: 'Alta',   color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-100 dark:bg-red-900/30'    },
  medium: { label: 'Média',  color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  low:    { label: 'Baixa',  color: 'text-gray-600 dark:text-gray-400',   bg: 'bg-gray-100 dark:bg-gray-800'    },
};

const CATEGORY_LABELS = { account: 'Conta', content: 'Conteúdo', billing: 'Cobrança', feedback: 'Feedback', other: 'Outro' };

/* ── Componente principal ─────────────────────────────────────────── */

const Support = () => {
  const [tickets,     setTickets]     = useState(MOCK_TICKETS);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState('');
  const [filterStatus,setFilterStatus]= useState('all');
  const [selected,    setSelected]    = useState(null);
  const [reply,       setReply]       = useState('');
  const [sending,     setSending]     = useState(false);

  const stats = {
    open:        tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    closed:      tickets.filter((t) => t.status === 'closed').length,
    total:       tickets.length,
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = !search || t.subject.toLowerCase().includes(search.toLowerCase()) || t.user.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSendReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await new Promise((r) => setTimeout(r, 600)); // simula chamada
      const newMsg = { from: 'admin', text: reply, at: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) };
      setTickets((prev) => prev.map((t) =>
        t.id === selected.id ? { ...t, messages: [...t.messages, newMsg], status: 'in_progress' } : t
      ));
      setSelected((prev) => ({ ...prev, messages: [...prev.messages, newMsg], status: 'in_progress' }));
      setReply('');
      toast.success('Resposta enviada!');
    } finally { setSending(false); }
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets((prev) => prev.map((t) => t.id === ticketId ? { ...t, status: newStatus } : t));
    if (selected?.id === ticketId) setSelected((prev) => ({ ...prev, status: newStatus }));
    toast.success('Status atualizado!');
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Central de Suporte</h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-12">
          Gerencie tickets e dúvidas dos usuários da plataforma
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',       value: stats.total,       color: 'text-gray-700 dark:text-gray-200',  bg: 'bg-gray-100 dark:bg-gray-800',         icon: MessageSquare },
          { label: 'Abertos',     value: stats.open,        color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-50 dark:bg-red-900/20',         icon: AlertCircle   },
          { label: 'Em Análise',  value: stats.in_progress, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-900/20', icon: Clock         },
          { label: 'Resolvidos',  value: stats.closed,      color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20',    icon: CheckCircle   },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Filtros + lista */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Lista de tickets */}
        <div className="lg:col-span-2 space-y-3">
          {/* Busca + filtro */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar tickets…"
                className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400" />
            </div>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
              <option value="all">Todos</option>
              <option value="open">Abertos</option>
              <option value="in_progress">Em Análise</option>
              <option value="closed">Resolvidos</option>
            </select>
          </div>

          {/* Tickets */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'thin' }}>
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum ticket encontrado</p>
              </div>
            ) : filtered.map((ticket) => {
              const sc   = STATUS_CONFIG[ticket.status];
              const pc   = PRIORITY_CONFIG[ticket.priority];
              const Icon = sc.icon;
              return (
                <button key={ticket.id} onClick={() => setSelected(ticket)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selected?.id === ticket.id
                      ? 'border-primary-300 dark:border-primary-700 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2">
                      {ticket.subject}
                    </p>
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${sc.color}`} />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                      <User className="w-3 h-3" />
                      {ticket.user}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${pc.bg} ${pc.color}`}>
                      {pc.label}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-auto">
                      {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalhe do ticket */}
        <div className="lg:col-span-3">
          {!selected ? (
            <Card className="flex flex-col items-center justify-center h-full min-h-[400px] text-gray-300 dark:text-gray-700">
              <MessageSquare className="w-12 h-12 mb-3" />
              <p className="text-sm font-medium text-gray-400 dark:text-gray-500">Selecione um ticket para visualizar</p>
            </Card>
          ) : (
            <Card className="p-5 flex flex-col h-full min-h-[400px]">
              {/* Ticket header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800 mb-4">
                <div className="min-w-0">
                  <h2 className="font-black text-gray-900 dark:text-white leading-tight">{selected.subject}</h2>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{selected.user}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{CATEGORY_LABELS[selected.category]}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(selected.createdAt).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {selected.status !== 'closed' && (
                    <button onClick={() => handleStatusChange(selected.id, 'closed')}
                      className="px-3 py-1.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                      ✓ Resolver
                    </button>
                  )}
                  {selected.status === 'open' && (
                    <button onClick={() => handleStatusChange(selected.id, 'in_progress')}
                      className="px-3 py-1.5 text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-colors">
                      Em Análise
                    </button>
                  )}
                </div>
              </div>

              {/* Mensagens */}
              <div className="flex-1 space-y-3 mb-4 max-h-72 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                {selected.messages.map((msg, i) => {
                  const isAdmin = msg.from === 'admin';
                  return (
                    <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                        isAdmin
                          ? 'bg-primary-600 text-white rounded-br-sm'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-white/60' : 'text-gray-400 dark:text-gray-500'}`}>
                          {isAdmin ? 'Admin' : selected.user} · {msg.at}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Resposta */}
              {selected.status !== 'closed' && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <div className="flex gap-2">
                    <textarea value={reply} onChange={(e) => setReply(e.target.value)}
                      rows={2} placeholder="Digite sua resposta…"
                      className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl resize-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40" />
                    <Button onClick={handleSendReply} loading={sending} disabled={!reply.trim()} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {selected.status === 'closed' && (
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    Ticket resolvido
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;