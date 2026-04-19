import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle, Activity, BookOpen, Heart } from 'lucide-react';
import { ShieldCheck, Star, Trophy } from 'lucide-react';
import { getImageUrl } from '../../utils/formatters';
import { ROLE_LABELS } from '../../utils/constants';
import Card from '../common/Card';

/* ── Helpers ─────────────────────────────────────────────────────── */

const FAV_TABS = [
  { id: 'all',   label: 'Todos'  },
  { id: 'manga', label: 'Mangás' },
  { id: 'novel', label: 'Novels' },
];

const StatPill = ({ emoji, label, value }) => (
  <div className="flex flex-col items-center gap-1 px-5 py-3 bg-white/60 dark:bg-gray-800/60 rounded-2xl backdrop-blur-sm border border-white/40 dark:border-gray-700/40">
    <span className="text-xl" aria-hidden>{emoji}</span>
    <span className="text-lg font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">
      {value}
    </span>
    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{label}</span>
  </div>
);

/* ── Componente principal ────────────────────────────────────────── */

const PublicProfileView = ({ user, stats, activity, achievements, favorites }) => {
  const [favoriteTab, setFavoriteTab] = useState('all');

  const allFavorites = favoriteTab === 'all'
    ? [
      ...(favorites?.mangas ?? []).map(item => ({ ...item, type: 'manga' })),
      ...(favorites?.novels ?? []).map(item => ({ ...item, type: 'novel' }))
    ]
    : favoriteTab === 'manga'
    ? (favorites?.mangas ?? [])
    : (favorites?.novels ?? []);

  const getItemType = (item) =>
    item.type
      ? item.type === 'manga' ? 'Mangá' : 'Novel'
      : (favorites?.mangas ?? []).some((m) => m.id === item.id) ? 'Mangá' : 'Novel';

  const getItemKey = (item) =>
    `${item.id}-${item.type ?? ((favorites?.mangas ?? []).some((m) => m.id === item.id) ? 'manga' : 'novel')}`;

  return (
    <div className="space-y-6">

      {/* ══════════════════════════════════════════════════════════
          HERO: banner + avatar + info + stats
      ══════════════════════════════════════════════════════════ */}
      <Card className="overflow-hidden">

        {/* Banner */}
        <div className="relative w-full h-52 overflow-hidden">
          {user?.banner_url ? (
            <img
              src={getImageUrl(user.banner_url)}
              alt="Banner do perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-500 to-purple-500" />
          )}
          {/* gradiente para criar transição suave com o conteúdo abaixo */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-gray-900/80 to-transparent" />
        </div>

        <div className="px-6 pb-6">
          {/* Avatar + nome (sobrepõe o banner) */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-700 border-4 border-white dark:border-gray-900 shadow-xl">
                {user?.avatar_url ? (
                  <img
                    src={getImageUrl(user.avatar_url)}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500 to-purple-500 text-white text-4xl font-black">
                    {user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              {user?.email_verified_at && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900" title="Email verificado">
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </div>

            {/* Nome + info */}
            <div className="flex-1 min-w-0 pb-1 pt-16 ">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white truncate">
                  {user?.username}
                </h2>
                {user?.google_sub && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Google
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                {ROLE_LABELS[user?.role]}
              </p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span>
                  Membro desde{' '}
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {user?.bio && (
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 max-w-2xl">
              {user.bio}
            </p>
          )}

          {/* Stats pills */}
          <div className="flex flex-wrap gap-3">
            <StatPill emoji="⭐" label="Favoritos"           value={stats?.total?.favorites          ?? 0} />
            <StatPill emoji="📖" label="Cap. Concluídos"     value={stats?.total?.completed_chapters ?? 0} />
            <StatPill emoji="👁️" label="Leituras Ativas"     value={stats?.total?.active_readings    ?? 0} />
          </div>
        </div>
      </Card>

      {/* ══════════════════════════════════════════════════════════
          LINHA DO MEIO: Atividade Recente  |  Conquistas
      ══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Atividade Recente */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-500" />
            Atividade Recente
          </h3>
          <div className="space-y-2">
            {activity.length === 0 ? (
              <EmptyState icon={<Activity className="w-8 h-8" />} text="Nenhuma atividade recente." />
            ) : (
              activity.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition group"
                >
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/50 transition">
                    <Activity className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Conquistas */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Conquistas
            {achievements.length > 0 && (
              <span className="ml-auto text-xs font-semibold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                {achievements.length}
              </span>
            )}
          </h3>
          {achievements.length === 0 ? (
            <EmptyState icon={<Trophy className="w-8 h-8" />} text="Nenhuma conquista ainda." />
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {achievements.map((item) => (
                <div
                  key={item.id}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/10 transition cursor-default"
                  title={item.name}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-2xl flex items-center justify-center border border-yellow-200/60 dark:border-yellow-800/40 group-hover:scale-110 transition-transform">
                    {item.icon_url ? (
                      <img src={item.icon_url} alt={item.name} className="w-7 h-7 object-contain" />
                    ) : (
                      <Star className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center leading-tight line-clamp-2">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ══════════════════════════════════════════════════════════
          OBRAS FAVORITAS — full width, covers grandes
      ══════════════════════════════════════════════════════════ */}
      <Card className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Obras Favoritas
            {allFavorites.length > 0 && (
              <span className="text-xs font-semibold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 px-2 py-0.5 rounded-full">
                {allFavorites.length}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2">
            {/* Filtro de tipo */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 gap-1">
              {FAV_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFavoriteTab(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    favoriteTab === tab.id
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Link
              to="/favorites"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 px-3 py-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
            >
              Ver tudo →
            </Link>
          </div>
        </div>

        {/* Grid de obras */}
        {allFavorites.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-10 h-10" />}
            text="Nenhuma obra favorita ainda."
            sub="As obras que você favoritar aparecerão aqui."
          />
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {allFavorites.map((item) => (
              <FavoriteCard key={getItemKey(item)} item={item} type={getItemType(item)} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

/* ── FavoriteCard ────────────────────────────────────────────────── */

const FavoriteCard = ({ item, type }) => (
  <div className="group flex flex-col gap-2 cursor-pointer">
    {/* Capa */}
    <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-sm group-hover:shadow-lg transition-shadow">
      <img
        src={getImageUrl(item.cover_image)}
        alt={item.title}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onError={(e) => { e.target.src = 'https://via.placeholder.com/120x180?text=N/A'; }}
      />
      {/* Overlay ao hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      {/* Badge de tipo */}
      <span className="absolute top-1.5 left-1.5 text-xs font-bold px-1.5 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-sm">
        {type === 'Mangá' ? 'M' : 'N'}
      </span>
    </div>

    {/* Título */}
    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight line-clamp-2 px-0.5 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
      {item.title}
    </p>
  </div>
);

/* ── EmptyState ──────────────────────────────────────────────────── */

const EmptyState = ({ icon, text, sub }) => (
  <div className="flex flex-col items-center justify-center py-10 gap-2 text-gray-300 dark:text-gray-700">
    {icon}
    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">{text}</p>
    {sub && <p className="text-xs text-gray-400 dark:text-gray-600">{sub}</p>}
  </div>
);

export default PublicProfileView;