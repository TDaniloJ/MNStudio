import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  const token = searchParams.get('token');
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  // Validar token ao montar o componente
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('Token inválido ou expirado');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('As senhas não conferem');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token, data.password);
      setSuccess(true);
      toast.success('Senha redefinida com sucesso!');
      
      // Redirecionar para login após 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      if (error.response?.status === 401) {
        setTokenValid(false);
        toast.error('Token expirado. Solicite um novo link de recuperação');
      } else {
        toast.error(error.response?.data?.error || 'Erro ao redefinir senha');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full">
                  <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                  Link Inválido
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  O link de recuperação de senha é inválido ou expirou.
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Links de recuperação expiram após 24 horas por segurança.
                </p>
              </div>

              <Link
                to="/forgot-password"
                className="inline-block"
              >
                <Button className="w-full">
                  Solicitar Novo Link
                </Button>
              </Link>

              <Link
                to="/login"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
              >
                Voltar para Login
              </Link>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-500 dark:to-primary-700 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-lg text-white dark:text-gray-200">
              <h2 className="text-4xl font-bold mb-6">
                Segurança em Primeiro Lugar
              </h2>
              <p className="text-xl text-primary-100 mb-8 dark:text-gray-300">
                Seus dados e conta estão protegidos com os mais altos padrões de segurança.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex">
        {/* Left Side */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                  Sucesso!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Sua senha foi redefinida com sucesso. Você será redirecionado para o login em alguns segundos...
                </p>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Ir para Login Agora
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-500 dark:to-primary-700 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="max-w-lg text-white dark:text-gray-200">
              <h2 className="text-4xl font-bold mb-6">
                Você está de volta!
              </h2>
              <p className="text-xl text-primary-100 mb-8 dark:text-gray-300">
                Sua conta está segura e pronta para uso. Faça login para continuar.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="p-3 bg-primary-600 rounded-2xl dark:bg-primary-500">
                <BookOpen className="w-8 h-8 text-white dark:text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">MN Studio</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
              Redefinir Senha
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Digite sua nova senha abaixo
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Nova Senha
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
                        message: 'Senha deve ter no mínimo 6 caracteres'
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
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Confirmar Senha
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
                      validate: (value) =>
                        value === password || 'As senhas não conferem'
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
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Dica:</strong> Use uma senha forte com letras maiúsculas, minúsculas, números e símbolos.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              <Lock className="w-5 h-5 mr-2" />
              Redefinir Senha
            </Button>

            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Lembrou sua senha?{' '}
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
              >
                Voltar para Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-500 dark:to-primary-700 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-white dark:text-gray-200">
            <h2 className="text-4xl font-bold mb-6">
              Sua segurança é importante
            </h2>
            <p className="text-xl text-primary-100 mb-8 dark:text-gray-300">
              Escolha uma senha forte e única para proteger sua conta.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center dark:bg-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Válido por 24 horas</h3>
                  <p className="text-primary-100 text-sm dark:text-gray-300">Este link expira após 24 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
