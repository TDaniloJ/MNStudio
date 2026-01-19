import React, { useEffect, useState } from 'react';
import {
  Crown,
  Shield,
  User,
  Trash2,
  Search,
  Edit,
  Eye,
  Lock,
  Ban,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Mail,
  UserPlus,
  BarChart3,
  Clock,
  Heart,
  MessageSquare,
  BookOpen,
  FileText,
  TrendingUp,
  Activity,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatNumber, formatDateTime } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    uploaders: 0,
    readers: 0,
    newToday: 0,
    newThisWeek: 0
  });

  const debouncedSearch = useDebounce(search, 500);
  const { page, goToPage } = usePagination();

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [page, debouncedSearch, filters]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          search: debouncedSearch,
          page,
          limit: 20,
          ...filters
        }
      });
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/admin/users/stats');
      setStats(response.data.stats || {});
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Papel do usuário atualizado!');
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar papel do usuário');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/admin/users/${userId}/status`, { status: newStatus });
      toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'}!`);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar status do usuário');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Tem certeza que deseja deletar o usuário "${username}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      toast.success('Usuário deletado com sucesso');
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao deletar usuário');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    if (!confirm(`Deletar ${selectedUsers.length} usuário(s) selecionado(s)? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      await api.post('/admin/users/bulk-delete', { user_ids: selectedUsers });
      toast.success(`${selectedUsers.length} usuário(s) deletado(s)`);
      setSelectedUsers([]);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Erro ao deletar usuários');
    }
  };

  const handleBulkRoleChange = async (newRole) => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    try {
      await api.post('/admin/users/bulk-role', { user_ids: selectedUsers, role: newRole });
      toast.success(`Papel alterado para ${selectedUsers.length} usuário(s)`);
      setSelectedUsers([]);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error('Erro ao alterar papel dos usuários');
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    try {
      await api.put(`/admin/users/${userId}/password`, { password: newPassword });
      toast.success('Senha resetada com sucesso!');
      setShowResetPasswordModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao resetar senha');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      await api.put(`/admin/users/${userId}`, userData);
      toast.success('Usuário atualizado com sucesso!');
      setShowEditModal(false);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar usuário');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await api.post('/admin/users', userData);
      toast.success('Usuário criado com sucesso!');
      setShowCreateModal(false);
      loadUsers();
      loadStats();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar usuário');
    }
  };

  const handleSendBulkEmail = async (emailData) => {
    if (selectedUsers.length === 0) {
      toast.error('Selecione pelo menos um usuário');
      return;
    }

    try {
      await api.post('/admin/users/bulk-email', {
        user_ids: selectedUsers,
        ...emailData
      });
      toast.success(`Email enviado para ${selectedUsers.length} usuário(s)`);
      setShowBulkEmailModal(false);
      setSelectedUsers([]);
    } catch (error) {
      toast.error('Erro ao enviar emails');
    }
  };

  const handleExportUsers = async () => {
    try {
      const response = await api.get('/admin/users/export', {
        params: filters,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Usuários exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar usuários');
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'uploader':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
        {isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
        {isActive ? 'Ativo' : 'Inativo'}
      </span>
    );
  };

  const clearFilters = () => {
    setFilters({
      role: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <Card className="p-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de Usuários</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total || pagination.total)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.active || 0)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{stats.admins || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 col-span-1 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Novos (7 dias)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.newThisWeek || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600">
            {pagination.total} usuário{pagination.total !== 1 ? 's' : ''} cadastrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowStatsModal(true)}
            variant="secondary"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Estatísticas
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button
            variant="secondary"
            onClick={handleExportUsers}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-blue-900">
              {selectedUsers.length} usuário(s) selecionado(s)
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowBulkEmailModal(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkRoleChange(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="">Alterar Papel</option>
                <option value="reader">Leitor</option>
                <option value="uploader">Uploader</option>
                <option value="admin">Admin</option>
              </select>
              <Button
                size="sm"
                variant="danger"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Deletar
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSelectedUsers([])}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filtros */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Papel
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os papéis</option>
                <option value="reader">Leitor</option>
                <option value="uploader">Uploader</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data de
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data até
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={clearFilters}>
              Limpar Filtros
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      <Card className="p-4">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar usuários por nome, email..."
        />
      </Card>

      {/* Users Table */}
      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Nenhum usuário encontrado</p>
          <p className="text-sm text-gray-400">
            {search || Object.values(filters).some(f => f)
              ? 'Tente ajustar os termos da busca ou filtros'
              : 'Os usuários serão listados aqui'
            }
          </p>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Papel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Atividade
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleSelectUser(user.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900">{user.email}</p>
                          {user.last_login && (
                            <p className="text-gray-500 text-xs">
                              Último login: {formatDate(user.last_login)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-800' :
                              user.role === 'uploader' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status || 'active')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {user.favorites_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" />
                            {user.comments_count || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {user.reading_time || 0}h
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-primary-600 transition"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-primary-600 transition"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetPasswordModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-orange-600 transition"
                            title="Resetar senha"
                          >
                            <Lock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                            className="p-2 text-gray-600 hover:text-purple-600 transition"
                            title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            title="Alterar papel"
                          >
                            <option value="reader">Leitor</option>
                            <option value="uploader">Uploader</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 text-gray-600 hover:text-red-600 transition disabled:opacity-50"
                            title="Deletar usuário"
                            disabled={user.role === 'admin' && user.id === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Paginação */}
          <Pagination
            currentPage={pagination.page || page}
            totalPages={pagination.pages}
            onPageChange={goToPage}
          />
        </>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateUser}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onSave={handleUpdateUser}
        />
      )}

      {showDetailsModal && selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedUser(null);
          }}
        />
      )}

      {showResetPasswordModal && selectedUser && (
        <ResetPasswordModal
          user={selectedUser}
          onClose={() => {
            setShowResetPasswordModal(false);
            setSelectedUser(null);
          }}
          onReset={handleResetPassword}
        />
      )}

      {showBulkEmailModal && (
        <BulkEmailModal
          userCount={selectedUsers.length}
          onClose={() => setShowBulkEmailModal(false)}
          onSend={handleSendBulkEmail}
        />
      )}

      {showStatsModal && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {/* Role Descriptions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Descrição dos Papéis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-gray-900">Administrador</h3>
            </div>
            <p className="text-sm text-gray-600">
              Acesso completo ao sistema. Pode gerenciar usuários, conteúdo e configurações.
            </p>
          </div>
          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Uploader</h3>
            </div>
            <p className="text-sm text-gray-600">
              Pode criar, editar e gerenciar mangás, novels e capítulos.
            </p>
          </div>
          <div className="p-4 border-2 border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Leitor</h3>
            </div>
            <p className="text-sm text-gray-600">
              Pode ler conteúdo, adicionar favoritos e manter histórico de leitura.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Modal de Criação de Usuário
const CreateUserModal = ({ onClose, onCreate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'reader',
    status: 'active',
    sendWelcomeEmail: true
  });

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: newPassword });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onCreate(formData);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Criar Novo Usuário"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome de usuário *"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          placeholder="usuario123"
          required
        />
        
        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="usuario@email.com"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Senha *
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Senha do usuário"
              required
            />
            <Button
              type="button"
              variant="secondary"
              onClick={generatePassword}
            >
              Gerar
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 6 caracteres
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Papel *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="reader">Leitor</option>
              <option value="uploader">Uploader</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendWelcomeEmail"
            checked={formData.sendWelcomeEmail}
            onChange={(e) => setFormData({ ...formData, sendWelcomeEmail: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="sendWelcomeEmail" className="text-sm text-gray-700">
            Enviar email de boas-vindas com credenciais
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Criar Usuário
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de Edição de Usuário
const EditUserModal = ({ user, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || '',
    email: user.email || '',
    role: user.role || 'reader',
    status: user.status || 'active'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(user.id, formData);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Editar Usuário"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nome de usuário"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          required
        />
        
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Papel
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="reader">Leitor</option>
              <option value="uploader">Uploader</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Salvar Alterações
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de Detalhes do Usuário - VERSÃO MELHORADA
const UserDetailsModal = ({ user, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    loadUserStats();
  }, [user.id]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${user.id}/stats`);
      setStats(response.data.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Detalhes do Usuário"
      size="xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 pb-4 border-b">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">{user.username}</h3>
            <p className="text-gray-600">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {ROLE_LABELS[user.role]}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </span>
              <span className="text-xs text-gray-500">ID: {user.id}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2 px-1 font-medium transition ${
              activeTab === 'info'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Informações
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 px-1 font-medium transition ${
              activeTab === 'activity'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Atividade
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`pb-2 px-1 font-medium transition ${
              activeTab === 'content'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Conteúdo
          </button>
        </div>

        {/* Content */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Papel</p>
                <p className="font-semibold text-gray-900">{ROLE_LABELS[user.role]}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className={`font-semibold ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {user.status === 'active' ? 'Ativo' : 'Inativo'}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Cadastrado em</p>
                <p className="font-semibold text-gray-900">{formatDate(user.created_at)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Último login</p>
                <p className="font-semibold text-gray-900">
                  {user.last_login ? formatDateTime(user.last_login) : 'Nunca logou'}
                </p>
              </div>
            </div>

            {user.created_by && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Criado por</p>
                <p className="font-semibold text-blue-900">{user.created_by}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            {loading ? (
              <Loading />
            ) : (
              <>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-600">{stats?.favorites_count || 0}</p>
                    <p className="text-sm text-gray-600">Favoritos</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-green-600">{stats?.comments_count || 0}</p>
                    <p className="text-sm text-gray-600">Comentários</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-orange-600">{stats?.reading_time || 0}h</p>
                    <p className="text-sm text-gray-600">Tempo de leitura</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Atividade Recente</h4>
                  {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                    <div className="space-y-2">
                      {stats.recent_activity.map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <Activity className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{activity.description}</span>
                          <span className="text-gray-400 text-xs ml-auto">{formatDate(activity.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhuma atividade recente</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'content' && (
          <div className="space-y-4">
            {loading ? (
              <Loading />
            ) : (
              <>
                {user.role !== 'reader' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Mangás Enviados</h4>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{stats?.mangas_uploaded || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">Novels Enviadas</h4>
                      </div>
                      <p className="text-2xl font-bold text-green-600">{stats?.novels_uploaded || 0}</p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Favoritos</h4>
                  {stats?.favorites && stats.favorites.length > 0 ? (
                    <div className="space-y-2">
                      {stats.favorites.slice(0, 5).map((fav, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                          <div className="w-10 h-14 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {fav.cover_image && (
                              <img src={fav.cover_image} alt={fav.title} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-900 truncate">{fav.title}</p>
                            <p className="text-xs text-gray-500">{fav.type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Nenhum favorito</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

// Modal de Reset de Senha
const ResetPasswordModal = ({ user, onClose, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [sendEmail, setSendEmail] = useState(true);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    
    setLoading(true);
    await onReset(user.id, password, sendEmail);
    setLoading(false);
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(password);
    toast.success('Senha copiada!');
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Resetar Senha"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ⚠️ A senha será alterada imediatamente após confirmar.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nova senha para <strong>{user.username}</strong>
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite ou gere uma senha"
              required
            />
            <Button
              type="button"
              variant="secondary"
              onClick={generatePassword}
            >
              Gerar
            </Button>
            {password && (
              <Button
                type="button"
                variant="secondary"
                onClick={copyPassword}
                title="Copiar senha"
              >
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Mínimo 6 caracteres. Recomendado: 12+ caracteres com letras, números e símbolos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="sendEmail" className="text-sm text-gray-700">
            Enviar email com a nova senha para o usuário
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading} variant="danger">
            Resetar Senha
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de Email em Massa
const BulkEmailModal = ({ userCount, onClose, onSend }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    includeUnsubscribeLink: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSend(formData);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Enviar Email para ${userCount} Usuário(s)`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Assunto *"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="Ex: Novidades da plataforma"
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mensagem *
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Escreva a mensagem do email..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Você pode usar {'{username}'} para personalizar com o nome do usuário
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="includeUnsubscribe"
            checked={formData.includeUnsubscribeLink}
            onChange={(e) => setFormData({ ...formData, includeUnsubscribeLink: e.target.checked })}
            className="rounded"
          />
          <label htmlFor="includeUnsubscribe" className="text-sm text-gray-700">
            Incluir link para cancelar inscrição
          </label>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            📧 Este email será enviado para {userCount} usuário(s) selecionado(s).
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            <Send className="w-4 h-4 mr-2" />
            Enviar Email
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Modal de Estatísticas
const StatsModal = ({ stats, onClose }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Estatísticas de Usuários"
      size="xl"
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold">{formatNumber(stats.total || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold">{formatNumber(stats.active || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Inativos</p>
                <p className="text-2xl font-bold">{formatNumber(stats.inactive || 0)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Novos (hoje)</p>
                <p className="text-2xl font-bold">{stats.newToday || 0}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Crown className="w-6 h-6 text-yellow-600" />
              <span className="text-2xl font-bold">{stats.admins || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Administradores</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-600"
                style={{ width: `${(stats.admins / stats.total) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-6 h-6 text-blue-600" />
              <span className="text-2xl font-bold">{stats.uploaders || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Uploaders</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600"
                style={{ width: `${(stats.uploaders / stats.total) * 100}%` }}
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <User className="w-6 h-6 text-gray-600" />
              <span className="text-2xl font-bold">{stats.readers || 0}</span>
            </div>
            <p className="text-sm text-gray-600">Leitores</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-600"
                style={{ width: `${(stats.readers / stats.total) * 100}%` }}
              />
            </div>
          </Card>
        </div>

        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Crescimento Semanal</h3>
          <p className="text-sm text-gray-600">
            Novos usuários esta semana: <strong className="text-primary-600">{stats.newThisWeek || 0}</strong>
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Novos usuários hoje: <strong className="text-primary-600">{stats.newToday || 0}</strong>
          </p>
        </Card>
      </div>
    </Modal>
  );
};

export default UserManagement;