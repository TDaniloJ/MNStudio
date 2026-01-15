import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
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
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md space-y-8">
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para Login
          </Link>

          {!sent ? (
            <>
              {/* Header */}
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 dark:text-white">
                  Recuperar Senha
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Digite seu email para receber instruções de recuperação
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
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

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Você receberá um email com um link para redefinir sua senha. O link expirará em 24 horas.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={loading}
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Enviar Email de Recuperação
                </Button>
              </form>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                    Email Enviado!
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Verifique sua caixa de entrada de <strong>{email}</strong> para receber as instruções de recuperação.
                  </p>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Dicas úteis:</p>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                    <li>Verifique a pasta de spam se não encontrar o email</li>
                    <li>O link de recuperação expira em 24 horas</li>
                    <li>Não responda ao email, clique no link fornecido</li>
                  </ul>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  className="w-full"
                  size="lg"
                >
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
            </>
          )}
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-500 dark:to-primary-700 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-lg text-white dark:text-gray-200">
            <h2 className="text-4xl font-bold mb-6">
              Recupere seu acesso
            </h2>
            <p className="text-xl text-primary-100 mb-8 dark:text-gray-300">
              Sua conta e seus dados de leitura estarão seguros. Redefina sua senha em alguns passos simples.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center dark:bg-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Rápido e Seguro</h3>
                  <p className="text-primary-100 text-sm dark:text-gray-300">Recuperação em poucos minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center dark:bg-gray-700">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Altamente Seguro</h3>
                  <p className="text-primary-100 text-sm dark:text-gray-300">Seus dados estão sempre protegidos</p>
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
