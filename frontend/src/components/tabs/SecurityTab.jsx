import React from 'react';
import { Lock, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';

/**
 * Aba de segurança: alteração de senha e configuração de 2FA.
 */
const SecurityTab = ({
  registerPassword,
  errorsPassword,
  handleSubmitPassword,
  handlePasswordChange,
  resetPassword,
  twoFA,
  onEnable2FA,
  onDisable2FA,
  loading,
  loadingDisable2FA,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Alterar Senha */}
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Alterar Senha</h3>
      <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="space-y-4">
        <Input
          label="Senha Atual"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errorsPassword.currentPassword?.message}
          {...registerPassword('currentPassword', {
            required: 'Senha atual é obrigatória',
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
              message: 'Senha deve ter no mínimo 8 caracteres',
            },
          })}
        />
        <Input
          label="Confirmar Nova Senha"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errorsPassword.confirmPassword?.message}
          {...registerPassword('confirmPassword', {
            required: 'Confirmação de senha é obrigatória',
            validate: (value, formValues) =>
              value === formValues.newPassword || 'As senhas não coincidem',
          })}
        />
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={() => resetPassword()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Alterar Senha
          </Button>
        </div>
      </form>
    </Card>

    {/* 2FA */}
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Autenticação de Dois Fatores
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Adicione uma camada extra de segurança à sua conta
          </p>
        </div>
        <ShieldCheck className="w-6 h-6 text-gray-400" />
      </div>

      {twoFA.enabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">2FA Ativado</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sua conta está protegida com autenticação de dois fatores.
          </p>
          <Button variant="danger" onClick={onDisable2FA} loading={loadingDisable2FA}>
            Desativar 2FA
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <XCircle className="w-5 h-5" />
            <span className="font-medium">2FA Desativado</span>
          </div>
          <Button onClick={onEnable2FA} loading={twoFA.settingUp} className="w-full">
            Ativar Autenticação de Dois Fatores
          </Button>
        </div>
      )}
    </Card>
  </div>
);

export default SecurityTab;
