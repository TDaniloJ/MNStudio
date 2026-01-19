import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  LifeBuoy,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const Support = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  const categories = [
    'Problema Técnico',
    'Erro em Capítulo',
    'Conta / Login',
    'Sugestão',
    'Denúncia',
    'Outro'
  ];

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      await api.post('/help-requests', {
        title: data.title,
        description: data.description
      });

      toast.success('Solicitação enviada com sucesso!');
      setSubmitted(true);
      reset();

      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 dark:text-white">
            Login necessário
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Faça login para abrir um chamado de suporte
          </p>
          <a href="/login">
            <Button>Entrar</Button>
          </a>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="container-custom text-center">
          <LifeBuoy className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-3">
            Suporte MN Studio
          </h1>
          <p className="text-primary-100">
            Abra um chamado e nossa equipe irá te ajudar
          </p>
        </div>
      </div>

      <div className="container-custom py-12 max-w-3xl mx-auto">

        <Card className="p-8">

          {submitted ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold mb-2 dark:text-white">
                Chamado enviado!
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Nossa equipe responderá em breve.
              </p>

              <Button onClick={() => setSubmitted(false)}>
                Abrir novo chamado
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold mb-2 dark:text-white">
                Criar Solicitação
              </h2>

              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Preencha o formulário abaixo com o máximo de detalhes possível.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Categoria *
                  </label>

                  <select
                    className="input"
                    {...register('title', { required: 'Selecione uma categoria' })}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(item => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Descrição *
                  </label>

                  <textarea
                    rows={6}
                    className="input"
                    placeholder="Explique seu problema ou sugestão..."
                    {...register('description', {
                      required: 'Mensagem obrigatória',
                      minLength: {
                        value: 20,
                        message: 'Mínimo de 20 caracteres'
                      }
                    })}
                  />

                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Usuário */}
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Enviando como: <strong>{user?.username}</strong>
                </div>

                {/* Botão */}
                <Button
                  type="submit"
                  loading={loading}
                  className="w-full"
                  size="lg"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Solicitação
                </Button>

              </form>
            </>
          )}

        </Card>

        {/* Info */}
        <div className="mt-6 p-5 bg-blue-50 rounded-lg border border-blue-200 text-sm dark:bg-blue-900 dark:border-blue-800 dark:text-gray-300">
          <h3 className="font-semibold mb-2 dark:text-white">
            ℹ️ Dicas para suporte rápido
          </h3>

          <ul className="space-y-1">
            <li>• Seja claro e detalhado</li>
            <li>• Informe nome do mangá/capítulo se necessário</li>
            <li>• Problemas técnicos → informe dispositivo</li>
            <li>• Resposta média: 24–48h</li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Support;
