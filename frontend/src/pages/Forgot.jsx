import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import AuthLayout from '../components/layout/AuthLayout';
import Button from '../components/common/Button';

const Forgot = () => {
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const email = watch('email');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.requestPasswordReset(data.email);
      setSent(true);
      toast.success('Email de recuperação enviado!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={sent ? 'Email enviado!' : 'Recuperar senha'}
      subtitle={
        sent
          ? `Verifique sua caixa de entrada`
          : 'Digite seu email para receber um link de recuperação'
      }
    >
      {!sent ? (
        /* ── Formulário ───────────────────────────────────────── */
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <div>
            <label className="block text-xs font-medium text-white/60 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="email"
                placeholder="seu@email.com"
                className={`w-full pl-9 pr-3 py-2.5 text-sm bg-white/10 border rounded-xl text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all ${
                  errors.email ? 'border-red-500/60' : 'border-white/10 hover:border-white/20'
                }`}
                {...register('email', {
                  required: 'Email é obrigatório',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' },
                })}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>

          {/* Info */}
          <div className="px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs text-blue-300/80 leading-relaxed">
              Você receberá um link para redefinir sua senha. O link expira em 24 horas.
            </p>
          </div>

          <Button type="submit" className="w-full !py-2.5" loading={loading}>
            <Send className="w-4 h-4 mr-2" />
            Enviar link de recuperação
          </Button>

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/60 transition-colors pt-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar para o login
          </Link>
        </form>
      ) : (
        /* ── Tela de sucesso ──────────────────────────────────── */
        <div className="space-y-5 text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div>
            <p className="text-sm text-white/60 leading-relaxed">
              Enviamos instruções para{' '}
              <span className="text-white font-semibold">{email}</span>.
              <br />
              Verifique também a pasta de spam.
            </p>
          </div>

          {/* Dicas */}
          <div className="text-left px-4 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl space-y-1.5">
            <p className="text-xs font-semibold text-yellow-300/80">Dicas:</p>
            {[
              'Verifique a pasta de spam se não encontrar o email',
              'O link de recuperação expira em 24 horas',
              'Clique no link do email — não responda ao email',
            ].map((tip) => (
              <p key={tip} className="text-xs text-yellow-300/60 flex items-start gap-1.5">
                <span className="text-yellow-500 flex-shrink-0 mt-0.5">·</span>
                {tip}
              </p>
            ))}
          </div>

          <Button className="w-full !py-2.5" onClick={() => navigate('/login')}>
            Voltar para o login
          </Button>

          <button
            onClick={() => setSent(false)}
            className="text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Não recebeu? Tentar novamente
          </button>
        </div>
      )}
    </AuthLayout>
  );
};

export default Forgot;
