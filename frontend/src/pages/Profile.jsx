import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  User, Mail, Lock, Camera, Settings, Shield,
  CreditCard, Monitor, Download, Trash2, LogOut,
  Smartphone, Globe, Bell, CheckCircle, XCircle,
  Key, QrCode, ShieldCheck, Activity, Edit, Eye, Heart, BookOpen as BookOpenIcon
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { getImageUrl } from '../utils/formatters';
import { ROLE_LABELS } from '../utils/constants';
import { statsService } from '../services/statsService';
import { activityService } from '../services/activityService';
import { badgeService } from '../services/userEnhancementService';
import { favoriteService } from '../services/favoriteService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// 🔧 MOVER Componente de Confirmação para ANTES do componente principal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

const Profile = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bioText, setBioText] = useState(user?.bio || '');
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);

  // Estados para novas funcionalidades
  const [emailVerification, setEmailVerification] = useState({
    sent: false,
    loading: false
  });
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [twoFA, setTwoFA] = useState({
    enabled: user?.two_factor_enabled || false,
    settingUp: false,
    qrCode: null,
    recoveryCodes: [],
    verificationCode: ''
  });
  const [activities, setActivities] = useState([]);
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    theme: 'light'
  });
  const [socialConnections, setSocialConnections] = useState([]);
  const [favorites, setFavorites] = useState({ mangas: [], novels: [] });
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const [favoriteTab, setFavoriteTab] = useState('all');
  const [subscription, setSubscription] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [unlinkGoogleLoading, setUnlinkGoogleLoading] = useState(false);

  const { register: registerProfile, handleSubmit: handleSubmitProfile, formState: { errors: errorsProfile }, reset: resetProfile } = useForm({
    defaultValues: {
      username: user?.username,
      email: user?.email
    }
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, watch, formState: { errors: errorsPassword }, reset: resetPassword } = useForm();

  const password = watch('newPassword');

  // Tabs config
  const publicTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'activity', label: 'Atividade', icon: Activity },
  ];

  const privateTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Lock },
    { id: 'sessions', label: 'Sessões', icon: Monitor },
    { id: 'preferences', label: 'Preferências', icon: Settings },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'billing', label: 'Assinatura', icon: CreditCard },
  ];

  const currentTabs = isEditing ? privateTabs : publicTabs;

  // Conquistas
  useEffect(() => {
    if (!user?.id) return;
    async function loadAchievements() {
      try {
        const data = await badgeService.getUserBadges(user.id);
        setAchievements(Array.isArray(data?.badges) ? data.badges : []);
      } catch (err) {
        console.error('Erro ao carregar conquistas:', err);
      }
    }

    loadAchievements();
  }, [user?.id]);

  // 🔄 Alternar entre modo visualização e edição
  const handleEditToggle = () => {
    if (isEditing) {
      // Sair do modo edição - resetar alterações
      resetProfile();
      setAvatarFile(null);
      setAvatarPreview(null);
    }
    setIsEditing(!isEditing);
  };

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await statsService.getMyStats();
        setStats(data);
      } catch (err) {
        console.error('Erro ao carregar stats:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  // Sincronizar biografia com dados do usuário
  useEffect(() => {
    if (user?.bio !== undefined) {
      setBioText(user.bio || '');
    }
  }, [user?.bio]);

  //Atividade Recentes
  useEffect(() => {
    if (user?.id !== undefined) {
      async function loadActivity() {
        try {
          const data = await activityService.getMyActivity();
          setActivity(data);
        } catch (err) {
          console.error('Erro ao carregar atividade:', err);
        } finally {
          setLoading(false);
        }
      }

      loadActivity();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id !== undefined) {
      async function loadFavorites() {
        try {
          setFavoritesLoading(true);
          const data = await favoriteService.getUserFavorites();
          setFavorites(data?.favorites || { mangas: [], novels: [] });
        } catch (err) {
          console.error('Erro ao carregar favoritos:', err);
        } finally {
          setFavoritesLoading(false);
        }
      }

      loadFavorites();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.bio !== undefined) {
      setBioText(user.bio || '');
    }
  }, [user]);

  // Efeitos para carregar dados
  useEffect(() => {
    if (activeTab === 'sessions' && isEditing) {
      fetchSessions();
    }
    if (activeTab === 'preferences' && isEditing) {
      fetchPreferences();
    }
  }, [activeTab, isEditing]);

  // 🔐 Verificação de Email
  const handleSendVerification = async () => {
    try {
      setEmailVerification(prev => ({ ...prev, loading: true }));
      await authService.sendVerificationEmail();
      setEmailVerification({ sent: true, loading: false });
      toast.success('Email de verificação enviado!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao enviar email de verificação');
    }
  };

  // 🌐 Desvincular Google
  const handleUnlinkGoogle = async () => {
    try {
      setUnlinkGoogleLoading(true);
      await authService.unlinkGoogle();
      updateUser({ ...user, google_sub: null });
      toast.success('Conta desvinculada do Google com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao desvincular Google');
    } finally {
      setUnlinkGoogleLoading(false);
    }
  };

  // 💻 Gerenciamento de Sessões
  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const response = await authService.getActiveSessions();
      setSessions(response.sessions);
    } catch (error) {
      toast.error('Erro ao carregar sessões');
    } finally {
      setLoadingSessions(false);
    }
  };

  const revokeSession = async (sessionId) => {
    try {
      await authService.revokeSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Sessão revogada com sucesso');
    } catch (error) {
      toast.error('Erro ao revogar sessão');
    }
  };

  const revokeAllSessions = async () => {
    try {
      await authService.revokeAllSessions();
      setSessions([]);
      toast.success('Todas as sessões foram revogadas');
    } catch (error) {
      toast.error('Erro ao revogar sessões');
    }
  };

  // 🔒 Autenticação de Dois Fatores (2FA)
  const enable2FA = async () => {
    try {
      setTwoFA(prev => ({ ...prev, settingUp: true }));
      const response = await authService.setup2FA();
      setTwoFA(prev => ({
        ...prev,
        qrCode: response.qr_code,
        recoveryCodes: response.recovery_codes,
        settingUp: false
      }));
      setShow2FAModal(true);
    } catch (error) {
      toast.error('Erro ao configurar 2FA');
      setTwoFA(prev => ({ ...prev, settingUp: false }));
    }
  };

  const confirm2FA = async () => {
    try {
      await authService.confirm2FA({ code: twoFA.verificationCode });
      setTwoFA(prev => ({ ...prev, enabled: true }));
      setShow2FAModal(false);
      toast.success('Autenticação de dois fatores ativada!');
    } catch (error) {
      toast.error('Código inválido');
    }
  };

  const disable2FA = async () => {
    try {
      await authService.disable2FA();
      setTwoFA({ enabled: false, settingUp: false, qrCode: null, recoveryCodes: [] });
      toast.success('Autenticação de dois fatores desativada');
    } catch (error) {
      toast.error('Erro ao desativar 2FA');
    }
  };

  // 📊 Preferências do Usuário
  const fetchPreferences = async () => {
    try {
      const response = await authService.getPreferences();
      setPreferences(response.preferences);
    } catch (error) {
      console.error('Erro ao carregar preferências');
    }
  };

  const updatePreferences = async (newPreferences) => {
    try {
      await authService.updatePreferences(newPreferences);
      setPreferences(newPreferences);
      toast.success('Preferências atualizadas!');
    } catch (error) {
      toast.error('Erro ao atualizar preferências');
    }
  };

  // 📥 Exportação de Dados
  const handleExportData = async () => {
    try {
      setLoading(true);
      const response = await authService.exportUserData();

      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Exclusão de Conta
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'CONFIRMAR') {
      toast.error('Digite "CONFIRMAR" para excluir a conta');
      return;
    }

    try {
      await authService.deleteAccount();
      toast.success('Conta excluída com sucesso');
      logout();
      navigate('/login');
    } catch (error) {
      toast.error('Erro ao excluir conta');
    }
  };

  // 👤 Upload de Avatar com Drag & Drop
  const handleAvatarChange = useCallback((e) => {
    const file = e.target.files?.[0];
    processAvatarFile(file);
  }, []);

  const processAvatarFile = (file) => {
    if (!file) return;

    // Validar tipo de arquivo
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Por favor, selecione uma imagem JPEG, PNG, GIF ou WebP');
      return;
    }

    // Validar tamanho do arquivo (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    console.log('✅ Avatar selecionado:', file.name, file.size);
    setAvatarFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const processBannerFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processBannerFile(file);
    }
  };

  const handleRemoveBanner = () => {
    setBannerFile(null);
    setBannerPreview(null);
  };

  const handleBannerDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    processBannerFile(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    processAvatarFile(file);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  // 📝 Atualização de Perfil
  const handleProfileUpdate = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('bio', bioText);

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await authService.updateProfile(formData);
      updateUser(response.user);

      // Atualizar banner se houver
      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', bannerFile);
        try {
          const bannerResponse = await authService.updateBanner(bannerFormData);
          // updateUser espera um objeto de usuário, não uma função
          updateUser({ ...user, banner_url: bannerResponse.banner_url });
        } catch (error) {
          console.error('Erro ao atualizar banner:', error);
        }
      }

      // Resetar estados após sucesso
      setAvatarFile(null);
      setAvatarPreview(null);
      setBannerFile(null);
      setBannerPreview(null);

      toast.success('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  // 🔑 Alteração de Senha
  const handlePasswordChange = async (data) => {
    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      toast.success('Senha alterada com sucesso!');
      resetPassword();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  // Componente de Visualização Pública do Perfil
  const PublicProfileView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card className="overflow-hidden">
          {/* Banner */}
          {user?.banner_url ? (
            <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img
                src={getImageUrl(user.banner_url)}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-gradient-to-r from-primary-600 to-primary-400"></div>
          )}

          <div className="p-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative -mt-20">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg">
                  {user?.avatar_url ? (
                    <img
                      src={getImageUrl(user.avatar_url)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary-600 text-white text-3xl font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.username}</h2>
                <p className="text-gray-600 dark:text-gray-400">{ROLE_LABELS[user?.role]}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Membro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">Informações</h3>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email}</span>
                  {user?.email_verified_at && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                  {user?.google_sub && (
                    <span className="ml-2 inline-flex items-center gap-1 text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-300 px-2 py-0.5 rounded">
                      <ShieldCheck className="w-3 h-3" />
                      Vinculado ao Google
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Resumo do Leitor
                </h3>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <span>⭐</span>
                    <div>
                      <p className="font-medium">Favoritos</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {stats?.total.favorites || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>📖</span>
                    <div>
                      <p className="font-medium">Capítulos Concluídos</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {stats?.total.completed_chapters || 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span>👁️</span>
                    <div>
                      <p className="font-medium">Leituras Ativas</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {stats?.total.active_readings || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Biografia</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {user?.bio || 'Este usuário ainda não adicionou uma biografia.'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Atividade e Conquistas */}
      <div className="lg:col-span-1 space-y-6">
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Atividade Recente</h3>
          <div className="space-y-3">
            {activity.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">Nenhuma atividade recente.</p>
            )}
            {activity.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">Conquistas</h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">Nenhuma conquista conquistada.</p>
            )}
            {achievements.map((item) => (
              <div key={item.id} className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
                <div className="w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-lg mb-1">
                  {item.icon}
                </div>
                <span className="text-xs font-medium">{item.title}</span>
              </div>
            ))}
            <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-lg mb-1">👤</div>
              <span className="text-xs font-medium">Perfil</span>
            </div>
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-lg mb-1">🔐</div>
              <span className="text-xs font-medium">Seguro</span>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <div className="w-10 h-10 mx-auto bg-green-100 rounded-full flex items-center justify-center text-green-600 text-lg mb-1">⭐</div>
              <span className="text-xs font-medium">Ativo</span>
            </div>
          </div>
        </Card>
      </div>

      {/* blocos abaixo do componente de Visualização Pública do Perfil */}
      <div className="lg:col-span-3 space-y-6">
        {/* Favoritos recentes */}
        <div>
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Favoritos Recentes</h3>
            <div className="flex gap-2 text-sm">
              {['all', 'manga', 'novel'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFavoriteTab(tab)}
                  className={`px-3 py-1 rounded-full font-medium transition ${
                    favoriteTab === tab
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab === 'all' ? 'Todos' : tab === 'manga' ? 'Mangás' : 'Novels'}
                </button>
              ))}
            </div>
          </div>

          {favoritesLoading ? (
            <p className="text-gray-600 dark:text-gray-400">Carregando favoritos...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(favoriteTab === 'all'
                ? [...favorites.mangas, ...favorites.novels]
                : favoriteTab === 'manga'
                ? favorites.mangas
                : favorites.novels
              )
                .slice(0, 8)
                .map((item) => (
                  <div key={`${item.id}-${item.type || (favorites.mangas.find((m) => m.id===item.id) ? 'manga' : 'novel')}`} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                      <img
                        src={getImageUrl(item.cover_image)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type ? item.type : favorites.mangas.some((m) => m.id === item.id) ? 'Mangá' : 'Novel'}
                      </p>
                    </div>
                  </div>
                ))}

              {((favoriteTab === 'all' && [...favorites.mangas, ...favorites.novels].length === 0) ||
                (favoriteTab === 'manga' && favorites.mangas.length === 0) ||
                (favoriteTab === 'novel' && favorites.novels.length === 0)) && (
                <p className="text-gray-600 dark:text-gray-400">Nenhum item encontrado em {favoriteTab === 'all' ? 'favoritos' : favoriteTab}.</p>
              )}
            </div>
          )}

          <div className="mt-4 text-right">
            <Link to="/favorites" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
              Ver tudo
            </Link>
          </div>
        </Card>
      </div>

    </div>
  </div>


  );

  // Componente de Upload de Avatar com Drag & Drop (apenas no modo edição)
  const AvatarUploadWithDrop = () => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500 dark:bg-transparent'
        }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => document.getElementById('avatar-upload').click()}
    >
      <Camera className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400 mb-2">
        Arraste uma imagem aqui ou clique para selecionar
      </p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        JPEG, PNG, GIF, WebP • Máx. 5MB
      </p>
      <Button type="button" variant="outline">
        Selecionar Arquivo
      </Button>
      <input
        id="avatar-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarChange}
      />
    </div>
  );

  return (
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header com Botão de Edição */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Perfil' : 'Meu Perfil'}
          </h1>
          <Button
            onClick={handleEditToggle}
            variant={isEditing ? "secondary" : "primary"}
          >
            {isEditing ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Visualizar Perfil
              </>
            ) : (
              <>
                <Edit className="w-4 h-4 mr-2" />
                Editar Perfil
              </>
            )}
          </Button>
        </div>

        {/* Tabs - Mostrar apenas se estiver editando */}
        {isEditing && (
          <div className="flex gap-1 mb-8 border-b overflow-x-auto">
            {currentTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 pb-3 px-4 font-medium transition whitespace-nowrap ${activeTab === tab.id
                      ? 'border-b-2 border-primary-600 text-primary-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Conteúdo Principal */}
        {!isEditing ? (
          <PublicProfileView />
        ) : (
          <>
            {/* Profile Tab - Modo Edição */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="p-6">
                    <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-6">
                      {/* Verificação de Email */}
                      {!user?.email_verified_at && (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-yellow-800">Email não verificado</span>
                            <p className="text-sm text-yellow-700">Verifique seu email para acessar todos os recursos</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            loading={emailVerification.loading}
                            disabled={emailVerification.sent}
                            onClick={handleSendVerification}
                          >
                            {emailVerification.sent ? 'Enviado' : 'Verificar'}
                          </Button>
                        </div>
                      )}

                      {/* Provedor Social */}
                      {user?.google_sub && (
                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
                          <ShieldCheck className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Conta vinculada ao Google</span>
                            <p className="text-sm text-blue-700 dark:text-blue-400">Você pode fazer login usando sua conta Google</p>
                          </div>
                        </div>
                      )} 

                      {/* Informações Básicas */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nome de usuário"
                          icon={User}
                          error={errorsProfile.username?.message}
                          {...registerProfile('username', {
                            required: 'Nome de usuário é obrigatório',
                            minLength: {
                              value: 3,
                              message: 'Nome deve ter no mínimo 3 caracteres'
                            }
                          })}
                        />

                        <Input
                          label="Email"
                          type="email"
                          icon={Mail}
                          error={errorsProfile.email?.message}
                          {...registerProfile('email', {
                            required: 'Email é obrigatório',
                            pattern: {
                              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                              message: 'Email inválido'
                            }
                          })}
                        />
                      </div>

                      {/* Avatar Upload */}
                      <div className="flex gap-6 items-start">
                        <AvatarUploadWithDrop />

                          {(avatarPreview || user?.avatar_url) && (
                          <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="relative">
                              <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 shadow-sm">
                                <img
                                  src={avatarPreview || getImageUrl(user.avatar_url)}
                                  alt="Avatar preview"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {avatarFile ? 'Nova imagem selecionada' : ''}
                              </p>

                              {avatarFile && (
                                <p className="text-sm text-green-600 dark:text-green-400">
                                  ✅ {avatarFile.name} ({(avatarFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                              )}
                            </div>

                            {avatarFile && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleRemoveAvatar}
                              >
                                Remover
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Banner Upload */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Banner do Perfil
                        </label>
                        <div
                          className={`border-2 border-dashed rounded-lg p-6 text-center transition cursor-pointer ${dragOver ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                            }`}
                          onDrop={handleBannerDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            id="banner-upload"
                            onChange={handleBannerChange}
                          />
                          <label htmlFor="banner-upload" className="cursor-pointer">
                            <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Clique ou arraste a imagem do banner
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              PNG, JPG até 10MB (recomendado 1920x400)
                            </p>
                          </label>
                        </div>

                        {/* Preview do Banner */}
                        {(bannerPreview || user?.banner_url) && (
                          <div className="mt-4 space-y-3">
                            <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                              <img
                                src={bannerPreview || getImageUrl(user.banner_url)}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex gap-2">
                              {bannerFile && (
                                <>
                                  <p className="flex-1 text-sm text-green-600 dark:text-green-400">
                                    ✅ {bannerFile.name}
                                  </p>
                                  <Button
                                    type="button"
                                    variant="danger"
                                    size="sm"
                                    onClick={handleRemoveBanner}
                                  >
                                    Remover
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Biografia */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Biografia ({bioText.length}/500)
                        </label>
                        <textarea
                          value={bioText}
                          onChange={(e) => setBioText(e.target.value.slice(0, 500))}
                          placeholder="Conte um pouco sobre você..."
                          maxLength={500}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white resize-none"
                          rows="4"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Máximo 500 caracteres
                        </p>
                      </div>



                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => {
                            resetProfile();
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                        >
                          Descartar
                        </Button>
                        <Button
                          type="submit"
                          loading={loading}
                          disabled={!avatarFile && !errorsProfile}
                        >
                          Salvar Alterações
                        </Button>
                      </div>
                    </form>
                  </Card>
                </div>

                {/* Sidebar - Informações da Conta */}
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Informações da Conta</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Membro desde</p>
                        <p className="font-medium">
                          {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Função</p>
                        <p className="font-medium">{ROLE_LABELS[user?.role]}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                        <div className="flex items-center gap-2">
                          
                          {user?.is_active ? (
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          ) : (
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          )}
                          <span className="font-medium">{user?.is_active ? 'Ativo' : 'Inativo'}</span>

                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Provedores Sociais */}
                  {user?.google_sub && (
                    <Card className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Contas Vinculadas</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm text-blue-900 dark:text-blue-100">Google</p>
                              <p className="text-xs text-blue-700 dark:text-blue-300">Conta vinculada</p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={unlinkGoogleLoading}
                            onClick={handleUnlinkGoogle}
                          >
                            Desvincular
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Alteração de Senha */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Alterar Senha</h3>
                  <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="space-y-4">
                    <Input
                      label="Senha Atual"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={errorsPassword.currentPassword?.message}
                      {...registerPassword('currentPassword', {
                        required: 'Senha atual é obrigatória'
                      })}
                    />

                    <Input
                      label="Nova Senha"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={errorsPassword.newPassword?.message}
                      {...registerPassword('newPassword', {
                        required: 'Nova senha é obrigatória',
                        minLength: {
                          value: 8,
                          message: 'Senha deve ter no mínimo 8 caracteres'
                        }
                      })}
                    />

                    <Input
                      label="Confirmar Senha"
                      type="password"
                      placeholder="••••••••"
                      icon={Lock}
                      error={errorsPassword.confirmPassword?.message}
                      {...registerPassword('confirmPassword', {
                        required: 'Confirmação de senha é obrigatória',
                        validate: value =>
                          value === password || 'As senhas não coincidem'
                      })}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => resetPassword()}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" loading={loading}>
                        Alterar Senha
                      </Button>
                    </div>
                  </form>
                </Card>

                {/* Autenticação de Dois Fatores */}
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 dark:text-white">
                        Autenticação de Dois Fatores
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Adicione uma camada extra de segurança à sua conta
                      </p>
                    </div>
                    <ShieldCheck className="w-6 h-6 text-gray-400 dark:text-gray-400" />
                  </div>

                  {twoFA.enabled ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">2FA Ativado</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sua conta está protegida com autenticação de dois fatores.
                      </p>
                      <Button variant="danger" onClick={disable2FA}>
                        Desativar 2FA
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">2FA Desativado</span>
                      </div>
                      <Button
                        onClick={enable2FA}
                        loading={twoFA.settingUp}
                        className="w-full"
                      >
                        Ativar Autenticação de Dois Fatores
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Sessions Tab */}
            {activeTab === 'sessions' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Sessões Ativas</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Gerencie suas sessões ativas em diferentes dispositivos
                    </p>
                  </div>
                  <Button variant="danger" onClick={revokeAllSessions} disabled={sessions.length <= 1}>
                    Encerrar Todas as Outras Sessões
                  </Button>
                </div>

                {loadingSessions ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Carregando sessões...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Monitor className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                          </div>
                          <div>
                            <p className="font-medium">{session.device}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {session.browser} • {session.location}
                            </p>
                            <p className="text-xs text-gray-500">
                              Última atividade: {new Date(session.last_activity).toLocaleString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {session.current && (
                            <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                              Esta sessão
                            </span>
                          )}
                          {!session.current && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => revokeSession(session.id)}
                            >
                              Encerrar
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Notificações</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações por Email</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receba atualizações importantes por email</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.email_notifications}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            email_notifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificações Push</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receba notificações no navegador</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences.push_notifications}
                          onChange={(e) => updatePreferences({
                            ...preferences,
                            push_notifications: e.target.checked
                          })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 dark:peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Preferências Gerais</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Idioma
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) => updatePreferences({
                          ...preferences,
                          language: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      >
                        <option value="pt-BR">Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Fuso Horário
                      </label>
                      <select
                        value={preferences.timezone}
                        onChange={(e) => updatePreferences({
                          ...preferences,
                          timezone: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      >
                        <option value="America/Sao_Paulo">Brasília (UTC-3)</option>
                        <option value="America/New_York">New York (UTC-5)</option>
                        <option value="Europe/London">London (UTC+0)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Tema
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => updatePreferences({
                          ...preferences,
                          theme: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                      >
                        <option value="light">Claro</option>
                        <option value="dark">Escuro</option>
                        <option value="system">Sistema</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 dark:text-white">Exportação de Dados</h3>
                  <div className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400">
                      Exporte todos os seus dados pessoais em formato JSON. Isso inclui suas informações de perfil, atividades e configurações.
                    </p>
                    <Button
                      onClick={handleExportData}
                      loading={loading}
                      variant="outline"
                      className="w-full dark:text-white dark:hover:text-black dark:border-gray-600 dark:hover:border-gray-600"
                    >
                      <Download className="w-4 h-4 mr-2 dark:text-white" />
                      Exportar Meus Dados
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 border">
                  <div className="flex items-start gap-3 mb-4">
                    <Trash2 className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 dark:text-red-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Excluir Conta</h3>
                      <p className="text-sm text-gray-600 mt-1 dark:text-gray-400">
                        Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Input
                      label={`Digite "CONFIRMAR" para excluir sua conta`}
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="CONFIRMAR"
                    />
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteModal(true)}
                      disabled={deleteConfirm !== 'CONFIRMAR'}
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Minha Conta Permanentemente
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Assinatura</h3>
                    <p className="text-gray-600 dark:text-gray-400">Gerencie sua assinatura e método de pagamento</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-400 dark:text-gray-600" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 border-2 border-primary-200 rounded-lg bg-primary-50 dark:bg-primary-900/10">
                    <h4 className="font-semibold text-primary-900 mb-2 dark:text-white">Plano Atual</h4>
                    <p className="text-2xl font-bold text-primary-600 mb-2 dark:text-white">Grátis</p>
                    <p className="text-primary-700 text-sm dark:text-gray-400">
                      Acesso básico a todas as funcionalidades principais
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h5 className="font-semibold mb-2">Próximo Passo</h5>
                      <p className="text-sm text-gray-600 mb-3 dark:text-gray-400">
                        Atualize para o plano Premium para desbloquear recursos exclusivos
                      </p>
                      <Button className="w-full" >
                        Ver Planos Premium
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão - AGORA DEFINIDO ANTES */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Excluir Conta Permanentemente"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos."
        confirmText="Excluir Conta"
        danger={true}
      />

      {/* Modal de Configuração do 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Configurar Autenticação de Dois Fatores</h3>

            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Escaneie o QR code com seu aplicativo autenticador
              </p>
              {twoFA.qrCode && (
                <img
                  src={twoFA.qrCode}
                  alt="QR Code para 2FA"
                  className="mx-auto border rounded-lg"
                />
              )}
            </div>

            <div className="space-y-4">
              <Input
                label="Código de Verificação"
                placeholder="Digite o código de 6 dígitos"
                value={twoFA.verificationCode}
                onChange={(e) => setTwoFA(prev => ({ ...prev, verificationCode: e.target.value }))}
                maxLength={6}
              />

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShow2FAModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={confirm2FA}
                  disabled={twoFA.verificationCode.length !== 6}
                  className="flex-1"
                >
                  Verificar
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Profile;