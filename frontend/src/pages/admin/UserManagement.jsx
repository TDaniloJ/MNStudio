import React, { useEffect, useState } from 'react';
import {
  Crown, Shield, User, Trash2, Search, Edit, Eye,
  Lock, Ban, CheckCircle, XCircle, Filter, Download,
  Mail, UserPlus, BarChart3, Clock, Heart, MessageSquare,
  BookOpen, FileText, TrendingUp, Activity, Send, Copy,
  Users, ChevronUp, ChevronDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatNumber, formatDateTime, getImageUrl } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';

/* ── Helpers ──────────────────────────────────────────────────────── */

const ROLE_CONFIG = {
  admin:    { label: 'Admin',    color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: Crown  },
  uploader: { label: 'Uploader', color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-100 dark:bg-blue-900/30',    icon: Shield },
  reader:   { label: 'Leitor',   color: 'text-gray-600 dark:text-gray-400',    bg: 'bg-gray-100 dark:bg-gray-800',       icon: User   },
};

const fieldCls = 'w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40';

const genPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/* ── Componente principal ─────────────────────────────────────────── */

const UserManagement = () => {
  const [users,         setUsers]         = useState([]);
  const [pagination,    setPagination]    = useState({ total: 0, pages: 1 });
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState('');
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showFilters,   setShowFilters]   = useState(false);
  const [filters,       setFilters]       = useState({ role: '', status: '', dateFrom: '', dateTo: '' });
  const [stats,         setStats]         = useState({ total: 0, active: 0, inactive: 0, admins: 0, uploaders: 0, readers: 0, newToday: 0, newThisWeek: 0 });

  // Modais
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'details' | 'password' | 'email' | 'stats'

  const debouncedSearch = useDebounce(search, 500);
  const { page, goToPage } = usePagination();

  useEffect(() => { loadUsers(); loadStats(); }, [page, debouncedSearch, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { params: { search: debouncedSearch, page, limit: 20, ...filters } });
      setUsers(res.data.users || []);
      setPagination(res.data.pagination || { total: 0, pages: 1 });
    } catch { toast.error('Erro ao carregar usuários'); }
    finally { setLoading(false); }
  };

  const loadStats = async () => {
    try { const r = await api.get('/admin/users/stats'); setStats(r.data.stats || {}); }
    catch { /* silencioso */ }
  };

  // Ações
  const handleChangeRole   = async (uid, role) => { try { await api.put(`/admin/users/${uid}/role`, { role }); toast.success('Papel atualizado!'); loadUsers(); loadStats(); } catch (e) { toast.error(e.response?.data?.error || 'Erro'); } };
  const handleToggleStatus = async (uid, cur)  => { const s = cur === 'active' ? 'inactive' : 'active'; try { await api.put(`/admin/users/${uid}/status`, { status: s }); toast.success(s === 'active' ? 'Usuário ativado!' : 'Usuário desativado!'); loadUsers(); loadStats(); } catch (e) { toast.error(e.response?.data?.error || 'Erro'); } };
  const handleDelete       = async (uid, name) => { if (!confirm(`Deletar "${name}"?`)) return; try { await api.delete(`/admin/users/${uid}`); toast.success('Usuário deletado'); loadUsers(); loadStats(); } catch (e) { toast.error(e.response?.data?.error || 'Erro'); } };
  const handleBulkDelete   = async ()          => { if (!selectedUsers.length) return; if (!confirm(`Deletar ${selectedUsers.length} usuário(s)?`)) return; try { await api.post('/admin/users/bulk-delete', { user_ids: selectedUsers }); toast.success(`${selectedUsers.length} deletado(s)`); setSelectedUsers([]); loadUsers(); loadStats(); } catch { toast.error('Erro ao deletar'); } };
  const handleBulkRole     = async (role)      => { if (!selectedUsers.length) return; try { await api.post('/admin/users/bulk-role', { user_ids: selectedUsers, role }); toast.success('Papel alterado!'); setSelectedUsers([]); loadUsers(); loadStats(); } catch { toast.error('Erro ao alterar papel'); } };
  const handleExport       = async ()          => { try { const res = await api.get('/admin/users/export', { params: filters, responseType: 'blob' }); const url = URL.createObjectURL(new Blob([res.data])); const a = document.createElement('a'); a.href = url; a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url); toast.success('Exportado!'); } catch { toast.error('Erro ao exportar'); } };

  const toggleSelect    = (uid) => setSelectedUsers((p) => p.includes(uid) ? p.filter((i) => i !== uid) : [...p, uid]);
  const toggleSelectAll = ()    => setSelectedUsers(selectedUsers.length === users.length ? [] : users.map((u) => u.id));

  const clearFilters = () => setFilters({ role: '', status: '', dateFrom: '', dateTo: '' });

  return (
    <div className="space-y-8">

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total',          value: formatNumber(stats.total || pagination.total), color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: Users        },
          { label: 'Ativos',         value: formatNumber(stats.active || 0),              color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-50 dark:bg-green-900/20',  icon: CheckCircle  },
          { label: 'Admins',         value: stats.admins || 0,                            color: 'text-yellow-600 dark:text-yellow-400',bg: 'bg-yellow-50 dark:bg-yellow-900/20',icon: Crown        },
          { label: 'Novos (7 dias)', value: stats.newThisWeek || 0,                       color: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-50 dark:bg-purple-900/20',icon: TrendingUp   },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${bg} flex-shrink-0`}><Icon className={`w-4 h-4 ${color}`} /></div>
            <div><p className="text-xs text-gray-500 dark:text-gray-400">{label}</p><p className={`text-2xl font-black tabular-nums ${color}`}>{value}</p></div>
          </Card>
        ))}
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Usuários</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total} usuário{pagination.total !== 1 ? 's' : ''} cadastrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModal('stats')}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <BarChart3 className="w-4 h-4" /> Estatísticas
          </button>
          <button onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border rounded-xl transition-all ${showFilters ? 'border-primary-400 dark:border-primary-600 text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            <Filter className="w-4 h-4" /> Filtros
          </button>
          <button onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Download className="w-4 h-4" /> Exportar
          </button>
          <Button size="sm" onClick={() => setModal('create')}>
            <UserPlus className="w-3.5 h-3.5 mr-1.5" /> Novo Usuário
          </Button>
        </div>
      </div>

      {/* ── Ações em massa ──────────────────────────────────────── */}
      {selectedUsers.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-2xl">
          <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">
            {selectedUsers.length} usuário{selectedUsers.length !== 1 ? 's' : ''} selecionado{selectedUsers.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setModal('email')}>
              <Mail className="w-3.5 h-3.5 mr-1.5" /> E-mail
            </Button>
            <select onChange={(e) => { if (e.target.value) { handleBulkRole(e.target.value); e.target.value = ''; } }}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/40">
              <option value="">Alterar papel…</option>
              <option value="reader">Leitor</option>
              <option value="uploader">Uploader</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Deletar
            </button>
            <button onClick={() => setSelectedUsers([])}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* ── Filtros ──────────────────────────────────────────────── */}
      {showFilters && (
        <Card className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Papel', key: 'role', options: [['', 'Todos os papéis'], ['reader', 'Leitor'], ['uploader', 'Uploader'], ['admin', 'Admin']] },
              { label: 'Status', key: 'status', options: [['', 'Todos'], ['active', 'Ativo'], ['inactive', 'Inativo']] },
            ].map(({ label, key, options }) => (
              <div key={key}>
                <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">{label}</label>
                <select value={filters[key]} onChange={(e) => setFilters((p) => ({ ...p, [key]: e.target.value }))} className={fieldCls}>
                  {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Data de</label>
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((p) => ({ ...p, dateFrom: e.target.value }))} className={fieldCls} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Data até</label>
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters((p) => ({ ...p, dateTo: e.target.value }))} className={fieldCls} />
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">Limpar filtros</button>
          </div>
        </Card>
      )}

      {/* ── Busca ────────────────────────────────────────────────── */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou email…"
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/40 text-gray-900 dark:text-white placeholder-gray-400" />
      </div>

      {/* ── Tabela ───────────────────────────────────────────────── */}
      {loading ? <Loading /> : users.length === 0 ? (
        <Card className="py-16 text-center text-gray-400 dark:text-gray-600">
          <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Nenhum usuário encontrado</p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-4 py-3 text-left w-8">
                      <input type="checkbox" checked={selectedUsers.length === users.length && users.length > 0}
                        onChange={toggleSelectAll} className="rounded accent-primary-500" />
                    </th>
                    {['Usuário', 'Contato', 'Papel', 'Status', 'Atividade', ''].map((h) => (
                      <th key={h} className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 ${h === '' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {users.map((user) => {
                    const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.reader;
                    const isActive = (user.status || 'active') === 'active';
                    return (
                      <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                        {/* Checkbox */}
                        <td className="px-4 py-3">
                          <input type="checkbox" checked={selectedUsers.includes(user.id)}
                            onChange={() => toggleSelect(user.id)} className="rounded accent-primary-500" />
                        </td>
                        {/* Usuário */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-xs overflow-hidden flex-shrink-0">
                              {user.avatar_url ? <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" /> : user.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{user.username}</p>
                              <p className="text-[10px] text-gray-400 dark:text-gray-500">ID {user.id}</p>
                            </div>
                          </div>
                        </td>
                        {/* Contato */}
                        <td className="px-4 py-3">
                          <p className="text-gray-700 dark:text-gray-300">{user.email}</p>
                          {user.last_login && <p className="text-xs text-gray-400 dark:text-gray-500">Login: {formatDate(user.last_login)}</p>}
                        </td>
                        {/* Papel */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <rc.icon className={`w-3.5 h-3.5 ${rc.color}`} />
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${rc.bg} ${rc.color}`}>{rc.label}</span>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                            {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            {isActive ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        {/* Atividade */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{user.favorites_count || 0}</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{user.reading_time || 0}h</span>
                          </div>
                        </td>
                        {/* Ações */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ActionBtn icon={Eye}  title="Detalhes"    onClick={() => { setSelectedUser(user); setModal('details'); }} />
                            <ActionBtn icon={Edit} title="Editar"      onClick={() => { setSelectedUser(user); setModal('edit');    }} />
                            <ActionBtn icon={Lock} title="Resetar senha" onClick={() => { setSelectedUser(user); setModal('password'); }} />
                            <ActionBtn icon={Ban}  title={isActive ? 'Desativar' : 'Ativar'} onClick={() => handleToggleStatus(user.id, user.status || 'active')} />
                            <select value={user.role} onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500/40">
                              <option value="reader">Leitor</option>
                              <option value="uploader">Uploader</option>
                              <option value="admin">Admin</option>
                            </select>
                            <ActionBtn icon={Trash2} title="Deletar" danger disabled={user.role === 'admin' && user.id === 1}
                              onClick={() => handleDelete(user.id, user.username)} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
          <Pagination currentPage={pagination.page || page} totalPages={pagination.pages} onPageChange={goToPage} />
        </>
      )}

      {/* ── Descrição dos papéis ────────────────────────────────── */}
      <Card className="p-5">
        <h2 className="text-base font-black text-gray-900 dark:text-white mb-4">Papéis do Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { key: 'admin',    desc: 'Acesso completo. Gerencia usuários, conteúdo e configurações.'          },
            { key: 'uploader', desc: 'Pode criar, editar e gerenciar mangás, novels e capítulos.'             },
            { key: 'reader',   desc: 'Pode ler conteúdo, adicionar favoritos e manter histórico de leitura.'  },
          ].map(({ key, desc }) => {
            const rc = ROLE_CONFIG[key];
            return (
              <div key={key} className={`flex gap-3 p-4 rounded-xl border ${rc.bg} border-current/10`}>
                <div className={`p-2 rounded-lg ${rc.bg} flex-shrink-0`}><rc.icon className={`w-4 h-4 ${rc.color}`} /></div>
                <div>
                  <p className={`font-bold text-sm ${rc.color}`}>{rc.label}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Modais ───────────────────────────────────────────────── */}
      {modal === 'create'   && <CreateUserModal   onClose={() => setModal(null)} onCreate={async (d) => { try { await api.post('/admin/users', d); toast.success('Usuário criado!'); setModal(null); loadUsers(); loadStats(); } catch (e) { toast.error(e.response?.data?.error || 'Erro'); } }} />}
      {modal === 'edit'     && selectedUser && <EditUserModal user={selectedUser} onClose={() => { setModal(null); setSelectedUser(null); }} onSave={async (uid, d) => { try { await api.put(`/admin/users/${uid}`, d); toast.success('Atualizado!'); setModal(null); loadUsers(); } catch (e) { toast.error(e.response?.data?.error || 'Erro'); } }} />}
      {modal === 'details'  && selectedUser && <UserDetailsModal user={selectedUser} onClose={() => { setModal(null); setSelectedUser(null); }} />}
      {modal === 'password' && selectedUser && <ResetPasswordModal user={selectedUser} onClose={() => { setModal(null); setSelectedUser(null); }} onReset={async (uid, pwd) => { try { await api.put(`/admin/users/${uid}/password`, { password: pwd }); toast.success('Senha resetada!'); setModal(null); } catch (e) { toast.error(e.response?.data?.error || 'Erro'); } }} />}
      {modal === 'email'    && <BulkEmailModal userCount={selectedUsers.length} onClose={() => setModal(null)} onSend={async (data) => { try { await api.post('/admin/users/bulk-email', { user_ids: selectedUsers, ...data }); toast.success('E-mail enviado!'); setModal(null); setSelectedUsers([]); } catch { toast.error('Erro ao enviar'); } }} />}
      {modal === 'stats'    && <StatsModal stats={stats} onClose={() => setModal(null)} />}
    </div>
  );
};

/* ── ActionBtn ────────────────────────────────────────────────────── */

const ActionBtn = ({ icon: Icon, title, onClick, danger, disabled }) => (
  <button title={title} onClick={onClick} disabled={disabled}
    className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${danger ? 'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'}`}>
    <Icon className="w-4 h-4" />
  </button>
);

/* ── Modais ───────────────────────────────────────────────────────── */

const CreateUserModal = ({ onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'reader', status: 'active', sendWelcomeEmail: true });
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); await onCreate(form); setLoading(false); };

  return (
    <Modal isOpen onClose={onClose} title="Novo Usuário" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome de usuário *" value={form.username} onChange={(e) => set('username', e.target.value)} placeholder="usuario123" required />
        <Input label="Email *" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="email@exemplo.com" required />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Senha *</label>
          <div className="flex gap-2">
            <input type="text" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Senha do usuário" required className={fieldCls + ' flex-1'} />
            <button type="button" onClick={() => set('password', genPassword())}
              className="px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">
              Gerar
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Mínimo 6 caracteres</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Papel</label>
            <select value={form.role} onChange={(e) => set('role', e.target.value)} className={fieldCls}>
              <option value="reader">Leitor</option><option value="uploader">Uploader</option><option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={fieldCls}>
              <option value="active">Ativo</option><option value="inactive">Inativo</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.sendWelcomeEmail} onChange={(e) => set('sendWelcomeEmail', e.target.checked)} className="rounded accent-primary-500" />
          <span className="text-xs text-gray-600 dark:text-gray-400">Enviar e-mail de boas-vindas</span>
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Criar Usuário</Button>
        </div>
      </form>
    </Modal>
  );
};

const EditUserModal = ({ user, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: user.username || '', email: user.email || '', role: user.role || 'reader', status: user.status || 'active' });
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); await onSave(user.id, form); setLoading(false); };
  return (
    <Modal isOpen onClose={onClose} title="Editar Usuário" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Nome de usuário" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} required />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} required />
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Papel', key: 'role', options: [['reader', 'Leitor'], ['uploader', 'Uploader'], ['admin', 'Admin']] },
            { label: 'Status', key: 'status', options: [['active', 'Ativo'], ['inactive', 'Inativo']] },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">{label}</label>
              <select value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} className={fieldCls}>
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}>Salvar</Button>
        </div>
      </form>
    </Modal>
  );
};

const UserDetailsModal = ({ user, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  useEffect(() => { api.get(`/admin/users/${user.id}/stats`).then((r) => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false)); }, [user.id]);
  const rc = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.reader;
  const isActive = (user.status || 'active') === 'active';
  return (
    <Modal isOpen onClose={onClose} title="Detalhes do Usuário" size="xl">
      <div className="space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl overflow-hidden">
            {user.avatar_url ? <img src={getImageUrl(user.avatar_url)} alt="" className="w-full h-full object-cover" /> : user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">{user.username}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${rc.bg} ${rc.color}`}><rc.icon className="w-3 h-3" />{rc.label}</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>{isActive ? 'Ativo' : 'Inativo'}</span>
              <span className="text-xs text-gray-400">ID {user.id}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
          {['info', 'activity', 'content'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize ${tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              {t === 'info' ? 'Informações' : t === 'activity' ? 'Atividade' : 'Conteúdo'}
            </button>
          ))}
        </div>
        {tab === 'info' && (
          <div className="grid grid-cols-2 gap-3">
            {[['Papel', rc.label], ['Status', isActive ? 'Ativo' : 'Inativo'], ['Cadastrado em', formatDate(user.created_at)], ['Último login', user.last_login ? formatDateTime(user.last_login) : 'Nunca']].map(([l, v]) => (
              <div key={l} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{l}</p>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{v}</p>
              </div>
            ))}
          </div>
        )}
        {tab === 'activity' && (
          loading ? <Loading /> : (
            <div className="grid grid-cols-3 gap-3">
              {[['Favoritos', stats?.favorites_count || 0, 'text-purple-600 dark:text-purple-400', 'bg-purple-50 dark:bg-purple-900/20', Heart], ['Comentários', stats?.comments_count || 0, 'text-green-600 dark:text-green-400', 'bg-green-50 dark:bg-green-900/20', MessageSquare], ['Tempo leitura', `${stats?.reading_time || 0}h`, 'text-orange-600 dark:text-orange-400', 'bg-orange-50 dark:bg-orange-900/20', Clock]].map(([l, v, color, bg, Icon]) => (
                <div key={l} className={`p-4 rounded-xl ${bg} text-center`}>
                  <Icon className={`w-6 h-6 mx-auto mb-1.5 ${color}`} />
                  <p className={`text-2xl font-black ${color}`}>{v}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{l}</p>
                </div>
              ))}
            </div>
          )
        )}
        {tab === 'content' && (
          loading ? <Loading /> : (
            <div className="space-y-4">
              {user.role !== 'reader' && (
                <div className="grid grid-cols-2 gap-3">
                  {[['Mangás', stats?.mangas_uploaded || 0, 'text-blue-600 dark:text-blue-400', 'bg-blue-50 dark:bg-blue-900/20', BookOpen], ['Novels', stats?.novels_uploaded || 0, 'text-green-600 dark:text-green-400', 'bg-green-50 dark:bg-green-900/20', FileText]].map(([l, v, color, bg, Icon]) => (
                    <div key={l} className={`p-4 rounded-xl ${bg} flex items-center gap-3`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                      <div><p className={`text-2xl font-black ${color}`}>{v}</p><p className="text-xs text-gray-600 dark:text-gray-400">{l} enviado{v !== 1 ? 's' : ''}</p></div>
                    </div>
                  ))}
                </div>
              )}
              {stats?.favorites?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Favoritos recentes</p>
                  <div className="space-y-2">
                    {stats.favorites.slice(0, 5).map((fav, i) => (
                      <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60">
                        <div className="w-8 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {fav.cover_image && <img src={fav.cover_image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0"><p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{fav.title}</p><p className="text-xs text-gray-400">{fav.type}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Modal>
  );
};

const ResetPasswordModal = ({ user, onClose, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const handleSubmit = async (e) => { e.preventDefault(); if (password.length < 6) { toast.error('Mínimo 6 caracteres'); return; } setLoading(true); await onReset(user.id, password, sendEmail); setLoading(false); };
  return (
    <Modal isOpen onClose={onClose} title="Resetar Senha" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-xs text-yellow-800 dark:text-yellow-200">
          ⚠️ A senha será alterada imediatamente para <strong>{user.username}</strong>.
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Nova senha</label>
          <div className="flex gap-2">
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite ou gere uma senha" required className={fieldCls + ' flex-1'} />
            <button type="button" onClick={() => setPassword(genPassword())}
              className="px-3 py-2 text-xs font-semibold border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap">Gerar</button>
            {password && <button type="button" onClick={() => { navigator.clipboard.writeText(password); toast.success('Copiada!'); }}
              className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"><Copy className="w-4 h-4" /></button>}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded accent-primary-500" /><span className="text-xs text-gray-600 dark:text-gray-400">Enviar nova senha por e-mail</span></label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading} variant="danger">Resetar Senha</Button>
        </div>
      </form>
    </Modal>
  );
};

const BulkEmailModal = ({ userCount, onClose, onSend }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', includeUnsubscribeLink: true });
  const handleSubmit = async (e) => { e.preventDefault(); setLoading(true); await onSend(form); setLoading(false); };
  return (
    <Modal isOpen onClose={onClose} title={`E-mail para ${userCount} usuário(s)`} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Assunto *" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Ex: Novidades da plataforma" required />
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-1.5">Mensagem *</label>
          <textarea value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} rows={6}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/40 resize-none"
            placeholder="Conteúdo do e-mail…" required />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use {'{username}'} para personalizar.</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.includeUnsubscribeLink} onChange={(e) => setForm((p) => ({ ...p, includeUnsubscribeLink: e.target.checked }))} className="rounded accent-primary-500" /><span className="text-xs text-gray-600 dark:text-gray-400">Incluir link de cancelamento</span></label>
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-700 dark:text-blue-300">
          📧 Será enviado para {userCount} usuário(s) selecionado(s).
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={loading}><Send className="w-3.5 h-3.5 mr-1.5" />Enviar</Button>
        </div>
      </form>
    </Modal>
  );
};

const StatsModal = ({ stats, onClose }) => (
  <Modal isOpen onClose={onClose} title="Estatísticas de Usuários" size="xl">
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Total', stats.total || 0, 'text-blue-600 dark:text-blue-400', 'bg-blue-50 dark:bg-blue-900/20', User], ['Ativos', stats.active || 0, 'text-green-600 dark:text-green-400', 'bg-green-50 dark:bg-green-900/20', CheckCircle], ['Inativos', stats.inactive || 0, 'text-red-600 dark:text-red-400', 'bg-red-50 dark:bg-red-900/20', XCircle], ['Novos hoje', stats.newToday || 0, 'text-purple-600 dark:text-purple-400', 'bg-purple-50 dark:bg-purple-900/20', TrendingUp]].map(([l, v, color, bg, Icon]) => (
          <div key={l} className={`p-4 rounded-xl ${bg} flex items-center gap-3`}>
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div><p className={`text-2xl font-black ${color} tabular-nums`}>{formatNumber(v)}</p><p className="text-xs text-gray-600 dark:text-gray-400">{l}</p></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[['Admins', stats.admins || 0, 'bg-yellow-500', ROLE_CONFIG.admin], ['Uploaders', stats.uploaders || 0, 'bg-blue-500', ROLE_CONFIG.uploader], ['Leitores', stats.readers || 0, 'bg-gray-500', ROLE_CONFIG.reader]].map(([l, v, barColor, rc]) => (
          <Card key={l} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2"><rc.icon className={`w-4 h-4 ${rc.color}`} /><span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{l}</span></div>
              <span className={`text-xl font-black ${rc.color}`}>{v}</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${stats.total ? (v / stats.total) * 100 : 0}%` }} />
            </div>
          </Card>
        ))}
      </div>
      <Card className="p-4 bg-gray-50 dark:bg-gray-800/60">
        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Crescimento</p>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Esta semana</p><p className="text-xl font-black text-primary-600 dark:text-primary-400">+{stats.newThisWeek || 0}</p></div>
          <div><p className="text-xs text-gray-500 dark:text-gray-400">Hoje</p><p className="text-xl font-black text-primary-600 dark:text-primary-400">+{stats.newToday || 0}</p></div>
        </div>
      </Card>
    </div>
  </Modal>
);

export default UserManagement;