import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Mail, Lock, Eye, EyeOff, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data);
      toast.success('Bem-vindo de volta!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential) => {
    try {
      setGoogleLoading(true);
      // Enviar o token JWT do Google para o backend para autenticação
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ googleToken: credential })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao fazer login com Google');
      }

      // Salvar token e fazer login
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Atualizar estado global de auth
      updateUser(data.user);

      toast.success('Login com Google realizado!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login com Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Inicializar Google Sign-In
  React.useEffect(() => {
    if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => handleGoogleLogin(response.credential)
      });

      // Renderizar o botão
      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          locale: 'pt_BR'
        }
      );
    }
  }, []);

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
                <BookOpen className="w-8 h-8 text-white dark:text-gray-900" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">MN Studio</span>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Bem-vindo de volta</h2>
            <p className="text-gray-600 dark:text-gray-400">Entre para continuar sua jornada de leitura</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4">
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
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:ring-offset-gray-800"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Lembrar-me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              <LogIn className="w-5 h-5 mr-2" />
              Entrar
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500 dark:bg-gray-900 dark:text-gray-400">ou</span>
              </div>
            </div>

            {/* Google Login Button */}
            <div id="google-signin-button"></div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
                >
                  Cadastre-se gratuitamente
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

export default Login;