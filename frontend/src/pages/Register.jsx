import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, Lock, User as UserIcon, Eye, EyeOff, BookOpen, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import Button from '../components/common/Button';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await registerUser({
        username: data.username,
        email: data.email,
        password: data.password
      });
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = password ? getPasswordStrength(password) : null;

  return (
    <div className="relative min-h-screen bg-gray-900 pb-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="p-3 bg-primary-600 rounded-2xl dark:bg-primary-500">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">MN Studio</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Criar conta</h2>
            <p className="text-gray-600 dark:text-gray-400">Comece a ler gratuitamente em segundos</p>
          </div>
          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Nome de usuário
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  type="text"
                  placeholder="seu_usuario"
                  className={`input pl-10 ${errors.username ? 'border-red-500' : ''}`}
                  {...register('username', {
                    required: 'Nome de usuário é obrigatório',
                    minLength: {
                      value: 3,
                      message: 'Mínimo de 3 caracteres'
                    },
                    maxLength: {
                      value: 50,
                      message: 'Máximo de 50 caracteres'
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message: 'Apenas letras, números e underscore'
                    }
                  })}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  className={`input pl-10 ${errors.email ? 'border-red-500' : ''}`}
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email inválido'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Mínimo de 6 caracteres'
                    }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
              )}
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${passwordStrength.textColor}`}>
                    {passwordStrength.text}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`input pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  {...register('confirmPassword', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: value =>
                      value === password || 'As senhas não coincidem'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-300" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:ring-offset-gray-900 dark:bg-gray-700 dark:border-gray-600"
                {...register('terms', {
                  required: 'Você deve aceitar os termos'
                })}
              />
              <label className="ml-2 text-sm text-gray-600">
                Eu aceito os{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300">
                  termos de uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300">
                  política de privacidade
                </Link>
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.terms.message}</p>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Criar conta
            </Button>

            {/* Login Link */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <div className="relative z-10 mt-10 w-full max-w-4xl px-4 mx-auto">
        <div className="rounded-3xl bg-white/90 dark:bg-gray-900/80 p-8 border border-gray-200 dark:border-gray-700 shadow-xl backdrop-blur-xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Sua biblioteca de mangás e novels</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">Acesse milhares de títulos, acompanhe seu progresso de leitura e descubra novas histórias incríveis.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Conteúdo atualizado</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Novos capítulos adicionados diariamente</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Totalmente gratuito</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Sem taxas ou assinaturas</p>
              </div>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-600/20 text-primary-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Continue de onde parou</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Histórico de leitura sincronizado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for password strength
function getPasswordStrength(password) {
  let score = 0;
  
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  const levels = {
    0: { text: 'Muito fraca', color: 'bg-red-500', textColor: 'text-red-600' },
    1: { text: 'Fraca', color: 'bg-orange-500', textColor: 'text-orange-600' },
    2: { text: 'Razoável', color: 'bg-yellow-500', textColor: 'text-yellow-600' },
    3: { text: 'Boa', color: 'bg-green-500', textColor: 'text-green-600' },
    4: { text: 'Forte', color: 'bg-green-600', textColor: 'text-green-700' },
  };

  return { score: Math.min(score, 4), ...levels[Math.min(score, 4)] };
}

export default Register;