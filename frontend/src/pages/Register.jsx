import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Mail, Lock, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/common/Button';

/* ── Força da senha ───────────────────────────────────────────── */
function getPasswordStrength(password) {
  let score = 0;
  if (password.length >= 6)  score++;
  if (password.length >= 10) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password))           score++;
  if (/[^a-zA-Z\d]/.test(password)) score++;

  const clamp = Math.min(score, 4);
  const levels = {
    0: { text: 'Muito fraca', bar: 'bg-red-500',    textColor: 'text-red-400'    },
    1: { text: 'Fraca',       bar: 'bg-orange-500',  textColor: 'text-orange-400' },
    2: { text: 'Razoável',    bar: 'bg-yellow-500',  textColor: 'text-yellow-400' },
    3: { text: 'Boa',         bar: 'bg-green-500',   textColor: 'text-green-400'  },
    4: { text: 'Forte',       bar: 'bg-emerald-500', textColor: 'text-emerald-400'},
  };
  return { score: clamp, ...levels[clamp] };
}

const Register = () => {
  const [loading,            setLoading]            = useState(false);
  const [showPassword,       setShowPassword]       = useState(false);
  const [showConfirmPassword,setShowConfirmPassword]= useState(false);
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const password        = watch('password');
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({ username: data.username, email: data.email, password: data.password });
      toast.success('Conta criada com sucesso!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Comece a ler gratuitamente em segundos"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

        {/* Username */}
        <AuthField label="Nome de usuário" icon={<UserIcon className="w-4 h-4" />} error={errors.username?.message}>
          <input
            type="text"
            placeholder="seu_usuario"
            className={authInputCls(!!errors.username)}
            {...register('username', {
              required: 'Nome de usuário é obrigatório',
              minLength: { value: 3, message: 'Mínimo 3 caracteres' },
              maxLength: { value: 50, message: 'Máximo 50 caracteres' },
              pattern: { value: /^[a-zA-Z0-9_]+$/, message: 'Apenas letras, números e _' },
            })}
          />
        </AuthField>

        {/* Email */}
        <AuthField label="Email" icon={<Mail className="w-4 h-4" />} error={errors.email?.message}>
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
            {...register('password', { required: 'Senha é obrigatória', minLength: { value: 6, message: 'Mínimo 6 caracteres' } })}
          />
        </AuthField>

        {/* Indicador de força */}
        {passwordStrength && (
          <div className="-mt-2">
            <div className="flex gap-1 mb-1">
              {[1, 2, 3, 4].map((l) => (
                <div
                  key={l}
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    l <= passwordStrength.score ? passwordStrength.bar : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
            <p className={`text-xs ${passwordStrength.textColor}`}>{passwordStrength.text}</p>
          </div>
        )}

        {/* Confirmar senha */}
        <AuthField
          label="Confirmar senha"
          icon={<Lock className="w-4 h-4" />}
          error={errors.confirmPassword?.message}
          suffix={
            <button type="button" onClick={() => setShowConfirmPassword((v) => !v)} className="text-white/30 hover:text-white/60 transition-colors pr-3">
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        >
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={authInputCls(!!errors.confirmPassword)}
            {...register('confirmPassword', {
              required: 'Confirmação obrigatória',
              validate: (v) => v === password || 'As senhas não coincidem',
            })}
          />
        </AuthField>

        {/* Termos */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 mt-0.5 rounded accent-primary-500 flex-shrink-0"
              {...register('terms', { required: 'Você deve aceitar os termos' })}
            />
            <span className="text-xs text-white/50 leading-relaxed">
              Eu aceito os{' '}
              <Link to="/terms" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">termos de uso</Link>
              {' '}e{' '}
              <Link to="/privacy" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">política de privacidade</Link>
            </span>
          </label>
          {errors.terms && <p className="mt-1 text-xs text-red-400">{errors.terms.message}</p>}
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full !py-2.5" loading={loading}>
          <UserPlus className="w-4 h-4 mr-2" />
          Criar conta
        </Button>

        {/* Login link */}
        <p className="text-center text-xs text-white/40 pt-1">
          Já tem conta?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
            Fazer login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

/* ── Helpers ─────────────────────────────────────────────────────── */

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

export default Register;
