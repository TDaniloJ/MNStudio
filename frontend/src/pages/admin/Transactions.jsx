import { toast } from 'react-hot-toast';
import { useState, useEffect, useCallback } from 'react';
import {
  Coins, TrendingUp, TrendingDown, Users, Search,
  Filter, RefreshCw, PlusCircle, MinusCircle, ChevronLeft,
  ChevronRight, Download, Sparkles, Award, Tag, ArrowUpDown,
  CheckCircle, XCircle, Clock, MoreVertical, Eye,
} from 'lucide-react';
import { coinService } from '../../services/coinService';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

/* ── Constantes ─────────────────────────────────────────────────── */

const TX_TYPES = [
  { value: '',         label: 'Todos os tipos' },
  { value: 'purchase', label: 'Compra'         },
  { value: 'spend',    label: 'Gasto'           },
  { value: 'bonus',    label: 'Bônus'           },
  { value: 'refund',   label: 'Reembolso'       },
  { value: 'admin',    label: 'Admin'           },
];

const PAGE_SIZES = [10, 25, 50, 100];

/* ── Helpers de UI ──────────────────────────────────────────────── */

const TX_ICON = {
  purchase: <PlusCircle  className="w-4 h-4 text-green-500"  />,
  spend:    <MinusCircle className="w-4 h-4 text-red-500"    />,
  bonus:    <Award       className="w-4 h-4 text-yellow-500" />,
  refund:   <RefreshCw   className="w-4 h-4 text-blue-500"   />,
  admin:    <Sparkles    className="w-4 h-4 text-purple-500" />,
};

const TX_BADGE = {
  purchase: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
  spend:    'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-300',
  bonus:    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  refund:   'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  admin:    'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
};

const TX_LABEL = {
  purchase: 'Compra',
  spend:    'Gasto',
  bonus:    'Bônus',
  refund:   'Reembolso',
  admin:    'Admin',
};

const amountColor = (amount) =>
  amount > 0
    ? 'text-green-600 dark:text-green-400'
    : 'text-red-500 dark:text-red-400';

/* ── Componente principal ───────────────────────────────────────── */

const Transactions = () => {
  // Dados
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats]               = useState(null);
  const [packages, setPackages]         = useState([]);

  // Filtros e paginação
  const [search,   setSearch]   = useState('');
  const [typeFilter, setType]   = useState('');
  const [page,     setPage]     = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total,    setTotal]    = useState(0);
  const [sortDir,  setSortDir]  = useState('desc'); // asc | desc

  // Loading
  const [loading,         setLoading]         = useState(true);
  const [loadingStats,    setLoadingStats]    = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Modal: ajuste manual de moedas
  const [adjustModal, setAdjustModal] = useState(null); // { userId, username }
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting,   setAdjusting]   = useState(false);

  /* ── Carregar dados ─────────────────────────────────────────── */

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await coinService.getAdminTransactions({
        page,
        limit: pageSize,
        type: typeFilter || undefined,
        search: search.trim() || undefined,
        sort: sortDir,
      });
      setTransactions(data.transactions ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast.error('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, typeFilter, search, sortDir]);

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const data = await coinService.getAdminStats();
      setStats(data);
    } catch {
      console.error('Erro ao carregar estatísticas');
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const loadPackages = useCallback(async () => {
    setLoadingPackages(true);
    try {
      const data = await coinService.getPackages();
      setPackages(data.packages ?? []);
    } catch {
      console.error('Erro ao carregar pacotes');
    } finally {
      setLoadingPackages(false);
    }
  }, []);

  useEffect(() => { loadStats(); loadPackages(); }, [loadStats, loadPackages]);
  useEffect(() => { loadTransactions(); }, [loadTransactions]);

  // Reseta para página 1 ao mudar filtros
  useEffect(() => { setPage(1); }, [typeFilter, search, pageSize, sortDir]);

  /* ── Ajuste manual de moedas ──────────────────────────────── */

  const handleAdjust = async () => {
    const amount = parseInt(adjustAmount, 10);
    if (!adjustModal?.userId || isNaN(amount) || amount === 0) {
      toast.error('Preencha usuário e quantidade válidos');
      return;
    }
    setAdjusting(true);
    try {
      await coinService.adminAdjustCoins({
        userId: adjustModal.userId,
        amount,
        reason: adjustReason || 'Ajuste manual pelo admin',
      });
      toast.success(`${amount > 0 ? '+' : ''}${amount} moedas aplicadas para ${adjustModal.username}`);
      setAdjustModal(null);
      setAdjustAmount('');
      setAdjustReason('');
      loadTransactions();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao ajustar moedas');
    } finally {
      setAdjusting(false);
    }
  };

  /* ── Exportar CSV ─────────────────────────────────────────── */

  const handleExport = async () => {
    try {
      const data = await coinService.getAdminTransactions({
        limit: 9999,
        type: typeFilter || undefined,
        search: search.trim() || undefined,
        sort: sortDir,
      });
      const rows = [
        ['ID', 'Usuário', 'Tipo', 'Quantidade', 'Descrição', 'Data'],
        ...(data.transactions ?? []).map((tx) => [
          tx.id,
          tx.user?.username ?? tx.user_id,
          TX_LABEL[tx.type] ?? tx.type,
          tx.amount,
          tx.description,
          formatDate(tx.created_at),
        ]),
      ];
      const csv  = rows.map((r) => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `transacoes-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exportado!');
    } catch {
      toast.error('Erro ao exportar');
    }
  };

  /* ── Paginação ────────────────────────────────────────────── */

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  /* ── Render ───────────────────────────────────────────────── */

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">

      {/* ── Cabeçalho ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transações &amp; Moedas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie todas as transações de moedas e pacotes do site
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" />
            Exportar CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setAdjustModal({ userId: '', username: '' })}
          >
            <PlusCircle className="w-4 h-4 mr-1.5" />
            Ajuste Manual
          </Button>
        </div>
      </div>

      {/* ── Cards de estatísticas ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total em Circulação"
          value={loadingStats ? '…' : (stats?.total_coins_circulating ?? 0).toLocaleString('pt-BR')}
          icon={<Coins className="w-5 h-5" />}
          color="yellow"
          sub="moedas ativas"
        />
        <StatCard
          label="Compradas (30d)"
          value={loadingStats ? '…' : (stats?.purchased_30d ?? 0).toLocaleString('pt-BR')}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          sub={`R$ ${((stats?.revenue_30d ?? 0)).toFixed(2).replace('.', ',')}`}
        />
        <StatCard
          label="Gastas (30d)"
          value={loadingStats ? '…' : (stats?.spent_30d ?? 0).toLocaleString('pt-BR')}
          icon={<TrendingDown className="w-5 h-5" />}
          color="red"
          sub="em conteúdo premium"
        />
        <StatCard
          label="Usuários com Saldo"
          value={loadingStats ? '…' : (stats?.users_with_coins ?? 0).toLocaleString('pt-BR')}
          icon={<Users className="w-5 h-5" />}
          color="blue"
          sub="com moedas > 0"
        />
      </div>

      {/* ── Pacotes cadastrados ────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Tag className="w-4 h-4 text-gray-400" />
            Pacotes de Moedas
          </h2>
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {packages.length} pacote{packages.length !== 1 ? 's' : ''} cadastrado{packages.length !== 1 ? 's' : ''}
          </span>
        </div>

        {loadingPackages ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`rounded-xl border p-4 flex flex-col gap-1 ${
                  pkg.highlight
                    ? 'border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/10'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {pkg.amount}
                    {pkg.bonus > 0 && (
                      <span className="text-green-600 dark:text-green-400 text-xs ml-1">
                        +{pkg.bonus}
                      </span>
                    )}
                  </span>
                  {pkg.highlight && (
                    <span className="text-xs bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded-full font-semibold">
                      Destaque
                    </span>
                  )}
                </div>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {parseFloat(pkg.price) === 0
                    ? 'Grátis'
                    : `R$ ${parseFloat(pkg.price).toFixed(2).replace('.', ',')}`}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {pkg.name ?? `Pacote #${pkg.id}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Tabela de transações ───────────────────────────────── */}
      <Card className="p-0 overflow-hidden">

        {/* Filtros */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-wrap gap-3 items-center">
          {/* Busca */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por usuário ou descrição…"
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Tipo */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setType(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {TX_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Ordenação */}
          <button
            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <ArrowUpDown className="w-4 h-4" />
            {sortDir === 'desc' ? 'Mais recentes' : 'Mais antigas'}
          </button>

          {/* Tamanho de página */}
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>{s} por página</option>
            ))}
          </select>

          <button
            onClick={loadTransactions}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            title="Recarregar"
          >
            <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Usuário
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Descrição
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Quantidade
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Saldo após
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Data
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-400 dark:text-gray-500">
                    Nenhuma transação encontrada.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                  >
                    {/* Usuário */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300 flex-shrink-0">
                          {(tx.user?.username ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {tx.user?.username ?? `ID ${tx.user_id}`}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {tx.user?.email ?? ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${TX_BADGE[tx.type] ?? 'bg-gray-100 text-gray-600'}`}>
                        {TX_ICON[tx.type] ?? <Coins className="w-3.5 h-3.5" />}
                        {TX_LABEL[tx.type] ?? tx.type}
                      </span>
                    </td>

                    {/* Descrição */}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-700 dark:text-gray-300 truncate">
                        {tx.description}
                      </p>
                    </td>

                    {/* Quantidade */}
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold tabular-nums ${amountColor(tx.amount)}`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </span>
                    </td>

                    {/* Saldo após */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-gray-500 dark:text-gray-400 tabular-nums">
                        {tx.balance_after != null ? tx.balance_after : '—'}
                      </span>
                    </td>

                    {/* Data */}
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {formatDate(tx.created_at)}
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setAdjustModal({
                          userId:   tx.user_id,
                          username: tx.user?.username ?? `ID ${tx.user_id}`,
                        })}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title="Ajustar moedas desse usuário"
                      >
                        <Coins className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total > 0
              ? `${((page - 1) * pageSize) + 1}–${Math.min(page * pageSize, total)} de ${total.toLocaleString('pt-BR')}`
              : '0 resultados'}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Números de página */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = totalPages <= 5
                ? i + 1
                : page <= 3
                  ? i + 1
                  : page >= totalPages - 2
                    ? totalPages - 4 + i
                    : page - 2 + i;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                    p === page
                      ? 'bg-primary-600 text-white'
                      : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {p}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>

      {/* ── Modal: ajuste manual de moedas ────────────────────── */}
      {adjustModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setAdjustModal(null)}
        >
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Ajuste Manual de Moedas
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Adicione ou remova moedas de um usuário diretamente.
            </p>

            {/* ID do usuário (editável se aberto pelo botão header) */}
            {!adjustModal.userId && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  ID do Usuário
                </label>
                <input
                  type="text"
                  value={adjustModal.userId}
                  onChange={(e) => setAdjustModal((m) => ({ ...m, userId: e.target.value }))}
                  placeholder="Ex: 42"
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {adjustModal.userId && (
              <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-700 dark:text-primary-300">
                  {adjustModal.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {adjustModal.username}
                  </p>
                  <p className="text-xs text-gray-400">ID {adjustModal.userId}</p>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Quantidade <span className="text-gray-400">(negativo para remover)</span>
              </label>
              <input
                type="number"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="Ex: 50 ou -20"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {adjustAmount && !isNaN(parseInt(adjustAmount)) && (
                <p className={`text-xs mt-1 font-semibold ${parseInt(adjustAmount) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {parseInt(adjustAmount) > 0 ? `+${adjustAmount} moedas serão adicionadas` : `${adjustAmount} moedas serão removidas`}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Motivo <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Ex: Bônus por evento especial"
                className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => { setAdjustModal(null); setAdjustAmount(''); setAdjustReason(''); }}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                loading={adjusting}
                onClick={handleAdjust}
                disabled={!adjustAmount || isNaN(parseInt(adjustAmount)) || parseInt(adjustAmount) === 0}
              >
                <Coins className="w-4 h-4 mr-1.5" />
                Aplicar Ajuste
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── StatCard ────────────────────────────────────────────────────── */

const COLOR = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300',
  green:  'bg-green-100  dark:bg-green-900/20  text-green-600  dark:text-green-300',
  red:    'bg-red-100    dark:bg-red-900/20    text-red-600    dark:text-red-300',
  blue:   'bg-blue-100   dark:bg-blue-900/20   text-blue-600   dark:text-blue-300',
};

const StatCard = ({ label, value, icon, color, sub }) => (
  <Card className="p-5 flex items-center gap-4">
    <div className={`p-3 rounded-xl flex-shrink-0 ${COLOR[color]}`}>
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
        {label}
      </p>
      <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
        {value}
      </p>
      {sub && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>
      )}
    </div>
  </Card>
);

export default Transactions;