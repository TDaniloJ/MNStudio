import React from 'react';
import { Mail, User, ShieldCheck } from 'lucide-react';
import { getImageUrl } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import ImageUploadArea from '../shared/ImageUploadArea';

/**
 * Aba de edição de perfil (username, email, bio, avatar, banner, idade).
 */
const ProfileEditTab = ({
  user,
  registerProfile,
  errorsProfile,
  handleSubmitProfile,
  handleProfileUpdate,
  resetProfile,
  bioText,
  setBioText,
  age,
  setAge,
  avatar,
  banner,
  emailVerification,
  onSendVerification,
  onUnlinkGoogle,
  unlinkGoogleLoading,
  loading,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Formulário principal */}
    <div className="lg:col-span-2">
      <Card className="p-6">
        <form onSubmit={handleSubmitProfile(handleProfileUpdate)} className="space-y-6">
          {/* Aviso de email não verificado */}
          {!user?.email_verified_at && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/10 dark:border-yellow-800">
              <Mail className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                  Email não verificado
                </span>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Verifique seu email para acessar todos os recursos
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                loading={emailVerification.loading}
                disabled={emailVerification.sent}
                onClick={onSendVerification}
              >
                {emailVerification.sent ? 'Enviado' : 'Verificar'}
              </Button>
            </div>
          )}

          {/* Conta vinculada ao Google */}
          {user?.google_sub && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Conta vinculada ao Google
                </span>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Você pode fazer login usando sua conta Google
                </p>
              </div>
            </div>
          )}

          {/* Username + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nome de usuário"
              icon={User}
              error={errorsProfile.username?.message}
              {...registerProfile('username', {
                required: 'Nome de usuário é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Nome deve ter no mínimo 3 caracteres',
                },
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
                  message: 'Email inválido',
                },
              })}
            />
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Foto de Perfil
            </label>
            <div className="flex gap-6 items-start">
              <div className="flex-1">
                <ImageUploadArea
                  id="avatar-upload"
                  dragOver={avatar.dragOver}
                  onDrop={avatar.handleDrop}
                  onDragOver={avatar.handleDragOver}
                  onDragLeave={avatar.handleDragLeave}
                  onChange={avatar.handleChange}
                  label="Fazer upload de avatar"
                  hint="JPEG, PNG, GIF, WebP · Máx. 5MB"
                />
              </div>

              {(avatar.preview || user?.avatar_url) && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 shadow-sm flex-shrink-0">
                    <img
                      src={avatar.preview || getImageUrl(user.avatar_url)}
                      alt="Preview do avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    {avatar.file && (
                      <>
                        <p className="text-sm text-green-600 dark:text-green-400 truncate">
                          ✅ {avatar.file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {(avatar.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="mt-2"
                          onClick={avatar.reset}
                        >
                          Remover
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Banner do Perfil
            </label>
            <ImageUploadArea
              id="banner-upload"
              dragOver={banner.dragOver}
              onDrop={banner.handleDrop}
              onDragOver={banner.handleDragOver}
              onDragLeave={banner.handleDragLeave}
              onChange={banner.handleChange}
              label="Fazer upload de banner"
              hint="PNG, JPG · Máx. 5MB · Recomendado 1920×400"
            />

            {(banner.preview || user?.banner_url) && (
              <div className="mt-4 space-y-3">
                <div className="relative w-full h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  <img
                    src={banner.preview || getImageUrl(user.banner_url)}
                    alt="Preview do banner"
                    className="w-full h-full object-cover"
                  />
                </div>
                {banner.file && (
                  <div className="flex items-center gap-2">
                    <p className="flex-1 text-sm text-green-600 dark:text-green-400 truncate">
                      ✅ {banner.file.name}
                    </p>
                    <Button type="button" variant="danger" size="sm" onClick={banner.reset}>
                      Remover
                    </Button>
                  </div>
                )}
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
              rows={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Máximo 500 caracteres</p>
          </div>

          {/* Idade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Idade
            </label>
            <input
              type="number"
              value={age ?? ''}
              min={1}
              max={120}
              onChange={(e) => setAge(e.target.value ? Number(e.target.value) : null)}
              placeholder="Sua idade"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Ações */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                resetProfile();
                avatar.reset();
                banner.reset();
              }}
            >
              Descartar
            </Button>
            <Button type="submit" loading={loading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </Card>
    </div>

    {/* Sidebar: informações + contas vinculadas */}
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
          Informações da Conta
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Membro desde</p>
            <p className="font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString('pt-BR')
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Função</p>
            <p className="font-medium">{ROLE_LABELS[user?.role]}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  user?.is_active ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className="font-medium">{user?.is_active ? 'Ativo' : 'Inativo'}</span>
            </div>
          </div>
        </div>
      </Card>

      {user?.google_sub && (
        <Card className="p-6">
          <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Contas Vinculadas
          </h3>
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
              onClick={onUnlinkGoogle}
            >
              Desvincular
            </Button>
          </div>
        </Card>
      )}
    </div>
  </div>
);

export default ProfileEditTab;
