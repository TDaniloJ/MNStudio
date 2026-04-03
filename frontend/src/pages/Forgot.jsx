import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const Forgot = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const email = watch('email');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      // Chamar endpoint de recuperação de senha
      await authService.requestPasswordReset(data.email);
      setSent(true);
      toast.success('Email de recuperação enviado!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao solicitar recuperação de senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-900 pb-20">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/login-bg.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </Link>

          {!sent ? (
            <>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">Recuperar Senha</h2>
                <p className="text-gray-600 dark:text-gray-400">Digite seu email para receber instruções de recuperação</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">Email</label>
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
                  {errors.email && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Você receberá um email com um link para redefinir sua senha. O link expirará em 24 horas.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  <Mail className="w-5 h-5 mr-2" /> Enviar Email de Recuperação
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">Email Enviado!</h2>
                <p className="text-gray-600 dark:text-gray-400">Verifique sua caixa de entrada de <strong>{email}</strong> para receber as instruções de recuperação.</p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-2">
                <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Dicas úteis:</p>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                  <li>Verifique a pasta de spam se não encontrar o email</li>
                  <li>O link de recuperação expira em 24 horas</li>
                  <li>Não responda ao email, clique no link fornecido</li>
                </ul>
              </div>

              <Button onClick={() => navigate('/login')} className="w-full" size="lg">
                Voltar para Login
              </Button>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Não recebeu o email?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
                >
                  Tentar novamente
                </button>
              </p>
            </div>
          )}
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
    </div>
  );
};

export default Forgot;
