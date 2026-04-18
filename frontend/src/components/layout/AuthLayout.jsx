import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, BookOpenCheck, Clock, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    title: 'Conteúdo atualizado',
    desc: 'Novos capítulos adicionados diariamente',
  },
  {
    icon: Sparkles,
    title: 'Obras selecionadas',
    desc: 'Mangás e novels das mais variadas categorias',
  },
  {
    icon: Clock,
    title: 'Continue de onde parou',
    desc: 'Histórico de leitura sincronizado na nuvem',
  },
  {
    icon: BookOpenCheck,
    title: 'Totalmente gratuito',
    desc: 'Acesse sem nenhuma taxa ou assinatura obrigatória',
  },
];

/**
 * Layout compartilhado para páginas de autenticação.
 * Fundo com capa desfocada + card de formulário à esquerda
 * + painel de destaques da plataforma abaixo.
 */
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="relative min-h-screen bg-gray-950 flex flex-col">
    {/* Fundo desfocado */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 bg-cover bg-center brightness-20 blur-sm scale-105"
        style={{ backgroundImage: "url('/src/assets/login-bg.jpg')" }}
      />
      {/* Gradientes */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/80 via-gray-950/60 to-gray-950/95" />
      <div className="absolute inset-0 bg-gradient-to-r from-gray-950/70 to-transparent" />
      {/* grain */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")' }}
      />
    </div>

    {/* Conteúdo */}
    <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-12 gap-8">

      {/* Card de formulário */}
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
          <div className="p-2 bg-primary-600 group-hover:bg-primary-500 rounded-xl transition-colors">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">MN Studio</span>
        </Link>

        {/* Título */}
        {(title || subtitle) && (
          <div className="mb-7">
            {title   && <h1 className="text-3xl font-black text-white tracking-tight mb-1">{title}</h1>}
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>
        )}

        {/* Slot do formulário */}
        <div className="bg-white/[0.07] dark:bg-white/[0.04] backdrop-blur-md rounded-2xl border border-white/10 p-7 shadow-2xl shadow-black/40">
          {children}
        </div>
      </div>

      {/* Painel de features */}
      <div className="w-full max-w-md">
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex gap-3 p-4 bg-white/[0.05] dark:bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/80 leading-tight">{title}</p>
                <p className="text-xs text-white/40 mt-0.5 leading-tight">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;
