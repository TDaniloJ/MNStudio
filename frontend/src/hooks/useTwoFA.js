import { useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';

const INITIAL_STATE = {
  enabled: false,
  settingUp: false,
  confirming: false,
  disabling: false,
  qrCode: null,
  recoveryCodes: [],
  verificationCode: '',
};

/**
 * Hook para gerenciar todo o fluxo de 2FA:
 * ativar, confirmar código, desativar.
 */
export function useTwoFA(initialEnabled = false) {
  const [twoFA, setTwoFA] = useState({ ...INITIAL_STATE, enabled: initialEnabled });
  const [showModal, setShowModal] = useState(false);

  const setField = (fields) => setTwoFA((prev) => ({ ...prev, ...fields }));

  const enable = async () => {
    setField({ settingUp: true });
    try {
      const response = await authService.setup2FA();
      setField({
        qrCode: response.qr_code,
        recoveryCodes: response.recovery_codes,
        settingUp: false,
      });
      setShowModal(true);
    } catch {
      toast.error('Erro ao configurar 2FA');
      setField({ settingUp: false });
    }
  };

  const confirm = async () => {
    setField({ confirming: true });
    try {
      await authService.confirm2FA({ code: twoFA.verificationCode });
      setField({ enabled: true, confirming: false, verificationCode: '' });
      setShowModal(false);
      toast.success('Autenticação de dois fatores ativada!');
    } catch {
      toast.error('Código inválido. Tente novamente.');
      setField({ confirming: false });
    }
  };

  const disable = async () => {
    setField({ disabling: true });
    try {
      await authService.disable2FA();
      setTwoFA({ ...INITIAL_STATE });
      toast.success('Autenticação de dois fatores desativada');
    } catch {
      toast.error('Erro ao desativar 2FA');
      setField({ disabling: false });
    }
  };

  const setVerificationCode = (code) => setField({ verificationCode: code });

  return {
    twoFA,
    showModal,
    closeModal: () => setShowModal(false),
    enable,
    confirm,
    disable,
    setVerificationCode,
  };
}
