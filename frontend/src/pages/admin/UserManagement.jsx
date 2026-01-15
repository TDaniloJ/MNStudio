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
  Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatDate, formatNumber } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import Card from '../../components/common/Card';
import SearchBar from '../../components/common/SearchBar';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { useDebounce } from '../../hooks/useDebounce';
import { usePagination } from '../../hooks/usePagination';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const debouncedSearch = useDebounce(search, 500);
  const { page, goToPage } = usePagination();

  useEffect(() => {
    loadUsers();
  }, [page, debouncedSearch, filters]);

const getTotalFavorites = (favorites) => {
  return (favorites.mangas?.length || 0) + (favorites.novels?.length || 0);
};

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

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      toast.success('Papel do usuário atualizado!');
      loadUsers();
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
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao deletar usuário');
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

  const handleExportUsers = async () => {
    try {
      const response = await api.get('/admin/users/export', {
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

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'uploader':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />;
    }
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'active';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {pagination.total} usuário{pagination.total !== 1 ? 's' : ''} cadastrado{pagination.total !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-3">
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
        </div>
      </div>

      {/* Filtros */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Papel
              </label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Todos os papéis</option>
                <option value="reader">Leitor</option>
                <option value="uploader">Uploader</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              >
                <option value="">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Data de (from)
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-300">
                Data até (to)
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
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
          <p className="text-gray-500 mb-4 dark:text-gray-400">Nenhum usuário encontrado</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
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
                <thead className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Papel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Cadastrado em
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase dark:text-gray-400">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold dark:bg-primary-400">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white dark:hover:text-primary-400">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">{user.email}</p>
                          {user.last_login && (
                            <p className="text-gray-500 text-xs dark:text-gray-400">
                              Último login: {formatDate(user.last_login)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(user.role)}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full dark:bg-gray-700 dark:text-gray-200 ${
                            user.role === 'admin' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            user.role === 'uploader' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {ROLE_LABELS[user.role]}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(user.status || 'active')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 dark:text-gray-200">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-primary-600 transition dark:text-gray-200"
                            title="Ver detalhes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-primary-600 transition dark:text-gray-200"
                            title="Editar usuário"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowResetPasswordModal(true);
                            }}
                            className="p-2 text-gray-600 hover:text-orange-600 transition dark:text-gray-200"
                            title="Resetar senha"
                          >
                            <Lock className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(user.id, user.status || 'active')}
                            className="p-2 text-gray-600 hover:text-purple-600 transition dark:text-gray-200"
                            title={user.status === 'active' ? 'Desativar usuário' : 'Ativar usuário'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          <select
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:ring-primary-400"
                            title="Alterar papel"
                          >
                            <option value="reader">Leitor</option>
                            <option value="uploader">Uploader</option>
                            <option value="admin">Admin</option>
                          </select>

                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="p-2 text-gray-600 hover:text-red-600 transition disabled:opacity-50 dark:text-gray-200"
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
          {pagination.pages > 1 && (
            <div className="flex justify-center">
              <div className="flex gap-2">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 rounded ${
                      page === pageNum 
                        ? 'bg-primary-600 text-white dark:bg-primary-400 dark:text-gray-900' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
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

      {/* Role Descriptions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 dark:text-white">
          Descrição dos Papéis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 dark:text-gray-200">
          <div className="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Administrador</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Acesso completo ao sistema. Pode gerenciar usuários, conteúdo e configurações.
            </p>
          </div>
          <div className="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Uploader</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pode criar, editar e gerenciar mangás, novels e capítulos.
            </p>
          </div>
          <div className="p-4 border-2 border-gray-200 rounded-lg dark:border-gray-600">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-200" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Leitor</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Pode ler conteúdo, adicionar favoritos e manter histórico de leitura.
            </p>
          </div>
        </div>
      </Card>
    </div>
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
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
              Papel
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="reader">Leitor</option>
              <option value="uploader">Uploader</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 dark:text-gray-400">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
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

// Modal de Detalhes do Usuário
const UserDetailsModal = ({ user, onClose }) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Detalhes do Usuário"
      size="lg"
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-xl dark:bg-primary-400">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{user.username}</h3>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Papel</p>
            <p className="font-semibold text-gray-900 dark:text-white">{ROLE_LABELS[user.role]}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Status</p>
            <p className={`font-semibold ${user.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {user.status === 'active' ? 'Ativo' : 'Inativo'}
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Cadastrado em</p>
            <p className="font-semibold text-gray-900 dark:text-white">{formatDate(user.created_at)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300">Último login</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {user.last_login ? formatDate(user.last_login) : 'Nunca logou'}
            </p>
          </div>
        </div>

        {/* Aqui você pode adicionar mais estatísticas quando tiver */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-gray-900 mb-3 dark:text-white">Estatísticas</h4>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.favorites_count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Favoritos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.comments_count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Comentários</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{user.reading_time || 0}h</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Tempo de leitura</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Modal de Reset de Senha
const ResetPasswordModal = ({ user, onClose, onReset }) => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

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
    if (!password) {
      toast.error('Digite uma senha');
      return;
    }
    
    setLoading(true);
    await onReset(user.id, password);
    setLoading(false);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Resetar Senha"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-400">
            Nova senha para {user.username}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Gerar ou digitar nova senha"
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
          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
            A senha será alterada imediatamente após confirmar.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Resetar Senha
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default UserManagement;