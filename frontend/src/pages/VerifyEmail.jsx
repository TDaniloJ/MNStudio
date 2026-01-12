import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser, user } = useAuthStore();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setMessage('Token de verificação não encontrado');
          toast.error('Link inválido ou expirado');
          return;
        }

        // Chamar endpoint para verificar email
        const response = await authService.verifyEmail(token);
        
        // Atualizar usuário no store
        if (response.user) {
          updateUser(response.user);
        }
        
        setStatus('success');
        setMessage('Email verificado com sucesso!');
        toast.success('Email verificado com sucesso!');
        
        // Redirecionar para perfil após 2 segundos
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.error || 'Erro ao verificar email');
        toast.error(error.response?.data?.error || 'Erro ao verificar email');
      }
    };

    verifyEmailToken();
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <Card className="p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-4">
              <Loader className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verificando email...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Por favor, aguarde enquanto verificamos seu email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verificado!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Redirecionando para seu perfil em breve...
            </p>
            <Button 
              onClick={() => navigate('/profile')}
              className="w-full mt-4"
            >
              Ir para Perfil
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro na Verificação
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {message}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              O link pode estar expirado ou ser inválido. Tente solicitar um novo email de verificação.
            </p>
            <div className="flex gap-3">
              <Button 
                variant="secondary"
                onClick={() => navigate('/profile')}
                className="flex-1"
              >
                Voltar ao Perfil
              </Button>
              <Button 
                onClick={() => navigate('/login')}
                className="flex-1"
              >
                Fazer Login
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default VerifyEmail;
