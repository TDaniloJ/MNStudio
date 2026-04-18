import React, { useEffect, useRef } from 'react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { Lock } from 'lucide-react';

/**
 * Modal de configuração do 2FA.
 * - Fecha ao pressionar Escape
 * - Foca o input de código ao abrir
 */
const TwoFAModal = ({ isOpen, twoFA, onVerificationCodeChange, onConfirm, onClose, loading }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="twofa-modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="p-6 max-w-md w-full">
        <h3 id="twofa-modal-title" className="text-lg font-semibold mb-4">
          Configurar Autenticação de Dois Fatores
        </h3>

        <div className="text-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
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
            ref={inputRef}
            label="Código de Verificação"
            placeholder="Digite o código de 6 dígitos"
            icon={Lock}
            value={twoFA.verificationCode}
            onChange={(e) => onVerificationCodeChange(e.target.value)}
            maxLength={6}
            inputMode="numeric"
            pattern="[0-9]*"
          />

          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              disabled={twoFA.verificationCode.length !== 6}
              loading={loading}
              className="flex-1"
            >
              Verificar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TwoFAModal;
