import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/common/Button';

const Login = () => {
  const [loading,       setLoading]       = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
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
    setGoogleLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

      const res = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken: credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao fazer login com Google');

      // 🔐 salva token
      localStorage.setItem('token', data.token);

      // 🔥 busca user completo
      const me = await authService.getMe();

      // ✅ salva user correto
      localStorage.setItem('user', JSON.stringify(me.user));
      updateUser(me.user);

      toast.success('Login com Google realizado!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Erro ao fazer login com Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  React.useEffect(() => {
    if (window.google && import.meta.env.VITE_GOOGLE_CLIENT_ID) {
      window.google.accounts.id.cancel(); // 🔥 limpa instâncias antigas

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response) => handleGoogleLogin(response.credential),
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { type: 'standard', theme: 'outline', size: 'large', locale: 'pt_BR' }
      );
    }
  }, []);

  return (
    <AuthLayout
      title="Bem-vindo de volta"
      subtitle="Entre para continuar sua jornada de leitura"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Email */}
        <AuthField
          label="Email"
          icon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
        >
          <input
            type="email"
            placeholder="seu@email.com"
            className={authInputCls(!!errors.email)}
            {...register('email', {
              required: 'Email é obrigatório',
              pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' },
            })}
          />
        </AuthField>

        {/* Senha */}
        <AuthField
          label="Senha"
          icon={<Lock className="w-4 h-4" />}
          error={errors.password?.message}
          suffix={
            <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-white/30 hover:text-white/60 transition-colors pr-3">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={authInputCls(!!errors.password)}
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: { value: 6, message: 'Mínimo 6 caracteres' },
            })}
          />
        </AuthField>

        {/* Lembrar + esqueceu */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="w-3.5 h-3.5 rounded accent-primary-500" />
            <span className="text-xs text-white/50">Lembrar-me</span>
          </label>
          <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
            Esqueceu a senha?
          </Link>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <Button type="submit" className="w-full !py-2.5" loading={loading}>
            <LogIn className="w-4 h-4 mr-2" />
            Entrar
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-white/30">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Google */}
        <div id="google-signin-button" className="flex justify-center " />

        {/* Register */}
        <p className="text-center text-xs text-white/40 pt-1">
          Não tem conta?{' '}
          <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Cadastre-se grátis
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

/* ── Helpers de campo ─────────────────────────────────────────── */

const authInputCls = (hasError) =>
  `w-full pl-9 pr-3 py-2.5 text-sm bg-white/10 border rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all ${
    hasError ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'
  }`;

const AuthField = ({ label, icon, error, suffix, children }) => (
  <div>
    <label className="block text-xs font-medium text-white/60 mb-1.5">{label}</label>
    <div className="relative flex items-center">
      <span className="absolute left-3 text-white/30">{icon}</span>
      <div className="w-full">{children}</div>
      {suffix && <div className="absolute right-0 flex items-center">{suffix}</div>}
    </div>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);

export default Login;
