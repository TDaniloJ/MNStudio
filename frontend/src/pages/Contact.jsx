import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Mail, 
  MessageSquare, 
  Send, 
  CheckCircle,
  MapPin,
  Clock,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      description: 'Responderemos em até 24 horas',
      value: 'contato@mnstudio.com',
      link: 'mailto:contato@mnstudio.com'
    },
    {
      icon: Clock,
      title: 'Horário de Atendimento',
      description: 'Segunda a Sexta',
      value: '09:00 - 18:00 (BRT)',
      link: null
    },
    {
      icon: MapPin,
      title: 'Localização',
      description: 'Nossa sede',
      value: 'Feira de Santana, Bahia - Brasil',
      link: null
    }
  ];

  const subjects = [
    'Suporte Técnico',
    'Solicitação de Uploader',
    'Reportar Conteúdo',
    'Sugestões',
    'Parcerias',
    'Outros'
  ];

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Enviar para o backend
      await api.post('/contact', data);
      setSubmitted(true);
      toast.success('Mensagem enviada com sucesso!');
      reset();
      
      // Resetar após 5 segundos
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 dark:from-primary-800 dark:to-primary-900">
        <div className="container-custom text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">
            Entre em Contato
          </h1>
          <p className="text-xl text-primary-100 dark:text-primary-200">
            Estamos aqui para ajudar! Envie sua mensagem e responderemos em breve.
          </p>
        </div>
      </div>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary-100 rounded-lg dark:bg-primary-900">
                      <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 dark:text-white">
                        {info.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 dark:text-gray-300">
                        {info.description}
                      </p>
                      {info.link ? (
                        <a
                          href={info.link}
                          className="text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-gray-900 font-medium dark:text-white">
                          {info.value}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* FAQ Link */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 dark:from-blue-900 dark:to-purple-900 dark:border-blue-800 hover:shadow-lg transition">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">
                Dúvidas Frequentes
              </h3>
              <p className="text-sm text-gray-600 mb-4 dark:text-gray-300">
                Veja se sua dúvida já foi respondida em nossa Central de Ajuda
              </p>
              <a href="/faq">
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                  Acessar FAQ →
                </button>
              </a>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4 dark:bg-green-900">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                    Mensagem Enviada!
                  </h2>
                  <p className="text-gray-600 mb-6 dark:text-gray-300">
                    Obrigado por entrar em contato. Responderemos em breve!
                  </p>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="secondary"
                  >
                    Enviar Outra Mensagem
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 dark:text-white">
                    Envie sua Mensagem
                  </h2>
                  <p className="text-gray-600 mb-6 dark:text-gray-300">
                    Preencha o formulário abaixo e nossa equipe entrará em contato
                  </p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Nome *"
                        placeholder="Seu nome completo"
                        error={errors.name?.message}
                        {...register('name', {
                          required: 'Nome é obrigatório'
                        })}
                      />

                      <Input
                        label="Email *"
                        type="email"
                        placeholder="seu@email.com"
                        error={errors.email?.message}
                        {...register('email', {
                          required: 'Email é obrigatório',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                          }
                        })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assunto *
                      </label>
                      <select
                        className="input"
                        {...register('subject', {
                          required: 'Selecione um assunto'
                        })}
                      >
                        <option value="">Selecione um assunto</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      {errors.subject && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                        Mensagem *
                      </label>
                      <textarea
                        rows={6}
                        className="input"
                        placeholder="Descreva sua dúvida, sugestão ou problema..."
                        {...register('message', {
                          required: 'Mensagem é obrigatória',
                          minLength: {
                            value: 20,
                            message: 'Mensagem deve ter no mínimo 20 caracteres'
                          }
                        })}
                      />
                      {errors.message && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                          {errors.message.message}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        className="mt-1"
                        {...register('terms', {
                          required: 'Você deve aceitar os termos'
                        })}
                      />
                      <label className="text-sm text-gray-600 dark:text-gray-300">
                        Eu concordo que minhas informações sejam usadas para responder minha mensagem de acordo com a{' '}
                        <a href="/privacy" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors">
                          Política de Privacidade
                        </a>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                        {errors.terms.message}
                      </p>
                    )}

                    <Button
                      type="submit"
                      loading={loading}
                      className="w-full"
                      size="lg"
                    >
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Mensagem
                    </Button>
                  </form>
                </>
              )}
            </Card>

            {/* Additional Info */}
            <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900 dark:border-blue-800">
              <h3 className="font-semibold text-gray-900 mb-2 dark:text-white">
                ℹ️ Informações Importantes
              </h3>
              <ul className="text-sm text-gray-700 space-y-2 dark:text-gray-300">
                <li>• Respondemos todas as mensagens em até 24-48 horas úteis</li>
                <li>• Para problemas técnicos urgentes, inclua o máximo de detalhes possível</li>
                <li>• Solicitações de uploader são analisadas individualmente</li>
                <li>• Não compartilhamos suas informações com terceiros</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;