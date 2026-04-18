import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  User, Lock, Settings, Shield, CreditCard, Monitor,
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';

// Hooks
import { useProfileData }    from '../hooks/useProfileData';
import { useProfileActions } from '../hooks/useProfileActions';
import { useImageUpload }    from '../hooks/useImageUpload';
import { useTwoFA }          from '../hooks/useTwoFA';
import { useSessions }       from '../hooks/useSessions';
import { usePreferences }    from '../hooks/usePreferences';

// Componentes compartilhados
import ProfileHeader from '../components/shared/ProfileHeader';
import TabNav        from '../components/shared/TabNav';

// Abas
import PublicProfileView from '../components/tabs/PublicProfileView';
import ProfileEditTab    from '../components/tabs/ProfileEditTab';
import SecurityTab       from '../components/tabs/SecurityTab';
import SessionsTab       from '../components/tabs/SessionsTab';
import PreferencesTab    from '../components/tabs/PreferencesTab';
import PrivacyTab        from '../components/tabs/PrivacyTab';
import BillingTab        from '../components/tabs/BillingTab';

// Modais
import ConfirmationModal from '../components/modals/ConfirmationModal';
import TwoFAModal        from '../components/modals/TwoFAModal';

/* ── Configuração de abas ───────────────────────────────────────── */

const EDIT_TABS = [
  { id: 'profile',     label: 'Perfil',        icon: User       },
  { id: 'security',    label: 'Segurança',      icon: Lock       },
  { id: 'sessions',    label: 'Sessões',        icon: Monitor    },
  { id: 'preferences', label: 'Preferências',   icon: Settings   },
  { id: 'privacy',     label: 'Privacidade',    icon: Shield     },
  { id: 'billing',     label: 'Assinatura',     icon: CreditCard },
];

/* ── Componente principal ───────────────────────────────────────── */

const Profile = () => {
  const { user } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const [bioText, setBioText] = useState(user?.bio || '');
  const [age,     setAge]     = useState(null);

  // Sincroniza bio quando o store for atualizado externamente
  useEffect(() => {
    if (user?.bio !== undefined) setBioText(user.bio || '');
  }, [user?.bio]);

  const [deleteConfirm,   setDeleteConfirm]   = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscription] = useState(null);

  /* ── Hooks de domínio ───────────────────────────────────────── */

  const profileData = useProfileData(user?.id);
  const actions     = useProfileActions();
  const avatar      = useImageUpload();
  const banner      = useImageUpload();
  const twoFA       = useTwoFA(user?.two_factor_enabled);
  const sessions    = useSessions();
  const prefs       = usePreferences();

  /* ── Formulários ────────────────────────────────────────────── */

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: errorsProfile },
    reset: resetProfile,
  } = useForm({ defaultValues: { username: user?.username, email: user?.email } });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
  } = useForm();

  /* ── Carregar dados ao trocar de aba ─────────────────────────── */

  useEffect(() => {
    if (!isEditing) return;
    if (activeTab === 'sessions')    sessions.fetch();
    if (activeTab === 'preferences') prefs.fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isEditing]);

  /* ── Handlers de formulário ──────────────────────────────────── */

  const handleProfileUpdate = (data) =>
    actions.updateProfile({
      data,
      bioText,
      age,
      avatarFile: avatar.file,
      bannerFile: banner.file,
      onSuccess: () => {
        avatar.reset();
        banner.reset();
        setIsEditing(false);
      },
    });

  const handlePasswordChange = (data) =>
    actions.changePassword({
      currentPassword: data.currentPassword,
      newPassword:     data.newPassword,
      onSuccess:       resetPassword,
    });

  /* ── Toggle edição ───────────────────────────────────────────── */

  const handleEditToggle = () => {
    if (isEditing) {
      resetProfile();
      avatar.reset();
      banner.reset();
    }
    setIsEditing((prev) => !prev);
    setActiveTab('profile');
  };

  /* ── Render ──────────────────────────────────────────────────── */

  return (
    <div className="container-custom py-8">
      <div className="max-w-6xl mx-auto">

        <ProfileHeader isEditing={isEditing} onToggle={handleEditToggle} />

        {isEditing && (
          <TabNav tabs={EDIT_TABS} activeTab={activeTab} onTabChange={setActiveTab} />
        )}

        {!isEditing ? (
          <PublicProfileView
            user={user}
            stats={profileData.stats}
            activity={profileData.activity}
            achievements={profileData.achievements}
            favorites={profileData.favorites}
          />
        ) : (
          <>
            {activeTab === 'profile' && (
              <ProfileEditTab
                user={user}
                registerProfile={registerProfile}
                errorsProfile={errorsProfile}
                handleSubmitProfile={handleSubmitProfile}
                handleProfileUpdate={handleProfileUpdate}
                resetProfile={resetProfile}
                bioText={bioText}
                setBioText={setBioText}
                age={age}
                setAge={setAge}
                avatar={avatar}
                banner={banner}
                emailVerification={actions.emailVerification}
                onSendVerification={actions.sendVerificationEmail}
                onUnlinkGoogle={actions.unlinkGoogle}
                unlinkGoogleLoading={actions.unlinkGoogleLoading}
                loading={actions.loading}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                registerPassword={registerPassword}
                errorsPassword={errorsPassword}
                handleSubmitPassword={handleSubmitPassword}
                handlePasswordChange={handlePasswordChange}
                resetPassword={resetPassword}
                twoFA={twoFA.twoFA}
                onEnable2FA={twoFA.enable}
                onDisable2FA={twoFA.disable}
                loading={actions.loading}
                loadingDisable2FA={twoFA.twoFA.disabling}
              />
            )}

            {activeTab === 'sessions' && (
              <SessionsTab
                sessions={sessions.sessions}
                loadingSessions={sessions.loading}
                onRevoke={sessions.revoke}
                onRevokeAll={sessions.revokeAll}
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesTab
                preferences={prefs.preferences}
                onUpdate={prefs.update}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyTab
                deleteConfirm={deleteConfirm}
                onDeleteConfirmChange={setDeleteConfirm}
                onOpenDeleteModal={() => setShowDeleteModal(true)}
                onExportData={actions.exportData}
                loading={actions.loading}
              />
            )}

            {activeTab === 'billing' && (
              <BillingTab subscription={subscription} />
            )}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={actions.deleteAccount}
        title="Excluir Conta Permanentemente"
        message="Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos."
        confirmText="Excluir Conta"
        danger
      />

      <TwoFAModal
        isOpen={twoFA.showModal}
        twoFA={twoFA.twoFA}
        onVerificationCodeChange={twoFA.setVerificationCode}
        onConfirm={twoFA.confirm}
        onClose={twoFA.closeModal}
        loading={twoFA.twoFA.confirming}
      />
    </div>
  );
};

export default Profile;
