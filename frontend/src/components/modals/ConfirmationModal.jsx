import React, { useEffect, useRef } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';

/**
 * Modal de confirmação reutilizável.
 * - Fecha ao pressionar Escape
 * - Foca o botão de confirmação ao abrir (acessibilidade)
 */
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  danger = false,
}) => {
  const confirmRef = useRef(null);

  // Fechar com Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focar botão de confirmação ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => confirmRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="p-6 max-w-md w-full">
        <h3 id="modal-title" className="text-lg font-semibold mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            ref={confirmRef}
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ConfirmationModal;
