import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

/**
 * Hook que centraliza todas as ações de mutação do perfil:
 * - Atualizar perfil (avatar, banner, bio, idade)
 * - Alterar senha
 * - Verificação de email
 * - Desvincular Google
 * - Exportar dados
 * - Excluir conta
 */
export function useProfileActions() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [unlinkGoogleLoading, setUnlinkGoogleLoading] = useState(false);
  const [emailVerification, setEmailVerification] = useState({ sent: false, loading: false });

  /* ── Atualizar perfil ─────────────────────────────────────────── */

  const updateProfile = async ({ data, bioText, age, avatarFile, bannerFile, onSuccess }) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('bio', bioText);
      if (age !== null && age !== undefined) formData.append('age', age);
      if (avatarFile) formData.append('avatar', avatarFile);

      const response = await authService.updateProfile(formData);
      let updatedUser = response.user;
      updateUser(updatedUser);

      if (bannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append('banner', bannerFile);
        try {
          const bannerResponse = await authService.updateBanner(bannerFormData);
          updatedUser = { ...updatedUser, banner_url: bannerResponse.banner_url };
          updateUser(updatedUser);
        } catch (err) {
          console.error('Erro ao atualizar banner:', err);
          toast.error('Perfil salvo, mas houve um erro ao atualizar o banner.');
        }
      }

      toast.success('Perfil atualizado com sucesso!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  /* ── Alterar senha ─────────────────────────────────────────────── */

  const changePassword = async ({ currentPassword, newPassword, onSuccess }) => {
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Senha alterada com sucesso!');
      onSuccess?.();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  /* ── Email ─────────────────────────────────────────────────────── */

  const sendVerificationEmail = async () => {
    setEmailVerification((prev) => ({ ...prev, loading: true }));
    try {
      await authService.sendVerificationEmail();
      setEmailVerification({ sent: true, loading: false });
      toast.success('Email de verificação enviado!');
    } catch (error) {
      setEmailVerification((prev) => ({ ...prev, loading: false }));
      toast.error(error.response?.data?.error || 'Erro ao enviar email de verificação');
    }
  };

  /* ── Google ─────────────────────────────────────────────────────── */

  const unlinkGoogle = async () => {
    setUnlinkGoogleLoading(true);
    try {
      await authService.unlinkGoogle();
      updateUser({ ...user, google_sub: null });
      toast.success('Conta desvinculada do Google com sucesso');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao desvincular Google');
    } finally {
      setUnlinkGoogleLoading(false);
    }
  };

  /* ── Exportar dados ─────────────────────────────────────────────── */

  const exportData = async () => {
    setLoading(true);
    try {
      const response = await authService.exportUserData();
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success('Dados exportados com sucesso!');
    } catch {
      toast.error('Erro ao exportar dados');
    } finally {
      setLoading(false);
    }
  };

  /* ── Excluir conta ──────────────────────────────────────────────── */

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount();
      toast.success('Conta excluída com sucesso');
      logout();
      navigate('/login');
    } catch {
      toast.error('Erro ao excluir conta');
    }
  };

  return {
    loading,
    emailVerification,
    unlinkGoogleLoading,
    updateProfile,
    changePassword,
    sendVerificationEmail,
    unlinkGoogle,
    exportData,
    deleteAccount,
  };
}
