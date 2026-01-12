import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  TrendingUp, 
  Eye, 
  Star, 
  Clock,
  Users,
  BookOpen,
  FileText,
  Crown,
  Medal,
  Award
} from 'lucide-react';
import toast from 'react-hot-toast';
import { rankingService } from '../services/rankingService';
import { getImageUrl, formatNumber } from '../utils/formatters';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';

const Rankings = () => {
  const [activeTab, setActiveTab] = useState('global');
  const [rankingType, setRankingType] = useState('views');
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab, rankingType, period]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      let result;

      switch (activeTab) {
        case 'global':
          result = await rankingService.getGlobalRankings(rankingType);
          setData(result.rankings || []);
          break;
        case 'mangas':
          result = await rankingService.getMangaRankings(rankingType, period);
          setData(result.mangas || []);
          break;
        case 'novels':
          result = await rankingService.getNovelRankings(rankingType, period);
          setData(result.novels || []);
          break;
        case 'users':
          result = await rankingService.getUserRankings(rankingType);
          setData(result.users || []);
          break;
      }
    } catch (error) {
      toast.error('Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const result = await rankingService.getGlobalStats();
      setStats(result.stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const tabs = [
    { id: 'global', label: 'Global', icon: Trophy },
    { id: 'mangas', label: 'Mangás', icon: BookOpen },
    { id: 'novels', label: 'Novels', icon: FileText },
    { id: 'users', label: 'Usuários', icon: Users }
  ];

  const rankingTypes = {
    global: [
      { value: 'views', label: 'Mais Vistos', icon: Eye },
      { value: 'rating', label: 'Melhor Avaliados', icon: Star }
    ],
    mangas: [
      { value: 'views', label: 'Mais Vistos', icon: Eye },
      { value: 'rating', label: 'Melhor Avaliados', icon: Star },
      { value: 'chapters', label: 'Mais Capítulos', icon: BookOpen },
      { value: 'recent', label: 'Mais Recentes', icon: Clock }
    ],
    novels: [
      { value: 'views', label: 'Mais Vistos', icon: Eye },
      { value: 'rating', label: 'Melhor Avaliados', icon: Star },
      { value: 'chapters', label: 'Mais Capítulos', icon: FileText },
      { value: 'recent', label: 'Mais Recentes', icon: Clock }
    ],
    users: [
      { value: 'uploads', label: 'Mais Uploads', icon: TrendingUp },
      { value: 'views', label: 'Mais Visualizações', icon: Eye },
      { value: 'chapters', label: 'Mais Capítulos', icon: BookOpen }
    ]
  };

  const periods = [
    { value: 'all', label: 'Todo Período' },
    { value: 'year', label: 'Último Ano' },
    { value: 'month', label: 'Último Mês' },
    { value: 'week', label: 'Última Semana' },
    { value: 'day', label: 'Hoje' }
  ];

  const getMedalIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-blue-500 dark:text-blue-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400 dark:text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-orange-600 dark:text-orange-500" />;
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{position}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 text-white dark:bg-gradient-to-r dark:from-blue-600 dark:via-blue-700 dark:to-blue-800  shadow-md">
        <div className="container-custom py-12">
          <div className="flex items-center gap-4 mb-4">
            <Trophy className="w-12 h-12" />
            <div>
              <h1 className="text-4xl font-bold">Rankings</h1>
              <p className="text-blue-100 dark:text-blue-200">
                Os melhores mangás, novels e usuários da plataforma
              </p>
            </div>
          </div>

          {/* Global Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 dark:bg-black/20">
                <p className="text-blue-100 text-sm dark:text-blue-200">Total de Conteúdos</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_content)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 dark:bg-black/20">
                <p className="text-blue-100 text-sm dark:text-blue-200">Total de Mangás</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_mangas)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 dark:bg-black/20">
                <p className="text-blue-100 text-sm dark:text-blue-200">Total de Novels</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_novels)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4 dark:bg-black/20">
                <p className="text-blue-100 text-sm dark:text-blue-200">Total de Visualizações</p>
                <p className="text-3xl font-bold">{formatNumber(stats.total_views)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setRankingType(rankingTypes[tab.id][0].value);
                }}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg whitespace-nowrap transform transition duration-150 ease-in-out cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white font-semibold shadow-lg dark:shadow-blue-700/30 dark:bg-blue-600 dark:text-blue-200'
                    : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-black/20 dark:text-gray-300 dark:hover:bg-black/30'
                } hover:scale-105 hover:shadow-xl`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Ranking Type */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                Tipo de Ranking
              </label>
              <div className="flex flex-wrap gap-2">
                {rankingTypes[activeTab]?.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setRankingType(type.value)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        rankingType === type.value
                          ? 'bg-primary-600 text-white dark:bg-primary-500 dark:text-white font-semibold shadow-lg dark:shadow-primary-700/30'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-black/20 dark:text-gray-300 dark:hover:bg-black/30'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period Filter (only for mangas/novels) */}
            {(activeTab === 'mangas' || activeTab === 'novels') && (
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  Período
                </label>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-black/20 dark:border-gray-700 dark:text-gray-300 dark:focus:ring-primary-600"
                >
                  {periods.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Card>

        {/* Rankings List */}
        {loading ? (
          <Loading />
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <RankingItem
                key={item.id ? `${item.id}-${index}` : `ranking-${index}`}
                item={item}
                position={index + 1}
                type={activeTab}
                rankingType={rankingType}
                getMedalIcon={getMedalIcon}
              />
            ))}

            {data.length === 0 && (
              <Card className="p-12 text-center">
                <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4 dark:text-gray-300" />
                <p className="text-gray-500 dark:text-gray-400">Nenhum resultado encontrado</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RankingItem = ({ item, position, type, rankingType, getMedalIcon }) => {
  if (!item) return null;
  
  const isUser = type === 'users';
  const contentType = item.content_type || type.slice(0, -1); // Remove 's' from 'mangas'/'novels'

  const getStatsValue = () => {
    switch (rankingType) {
      case 'views':
        return isUser ? item.total_views : item.views;
      case 'rating':
        return item.rating;
      case 'chapters':
        return isUser ? item.total_chapters : item.chapter_count;
      case 'uploads':
        return item.total_uploads;
      default:
        return item.views;
    }
  };

  const getStatsLabel = () => {
    switch (rankingType) {
      case 'views':
        return 'visualizações';
      case 'rating':
        return 'avaliação';
      case 'chapters':
        return 'capítulos';
      case 'uploads':
        return 'uploads';
      default:
        return 'visualizações';
    }
  };

  if (isUser) {
    return (
      <Card className={`p-4 hover:shadow-lg transition ${position <= 3 ? 'border-2 border-blue-400 dark:border-blue-300' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            {getMedalIcon(position)}
          </div>

          <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 dark:bg-primary-500">
            {item.username?.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{item.username}</h3>
            <p className="text-sm text-gray-600 capitalize dark:text-gray-300">{item.role}</p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-500">
              {formatNumber(getStatsValue())}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{getStatsLabel()}</p>
          </div>
        </div>
      </Card>
    );
  }

  const linkTo = type === 'global' 
    ? `/${contentType}/${item.id}` 
    : `/${contentType === 'manga' ? 'manga' : 'novel'}/${item.id}`;

  return (
    <Link to={linkTo}>
      <Card className={`p-4 hover:shadow-lg transition ${position <= 3 ? 'border-2 border-blue-400 dark:border-blue-300' : ''}`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-16 flex items-center justify-center">
            {getMedalIcon(position)}
          </div>

          <img
            src={getImageUrl(item.cover_image)}
            alt={item.title}
            className="w-16 h-24 object-cover rounded flex-shrink-0"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/100x150?text=No+Image';
            }}
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 dark:text-white">
              {item.title}
            </h3>
            <div className="flex gap-2 mt-1">
              {contentType && (
                <span className="inline-block px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded capitalize dark:bg-primary-900/30 dark:text-primary-200">
                  {contentType}
                </span>
              )}
              {item.type && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded capitalize dark:bg-black/20 dark:text-gray-300">
                  {item.type}
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-500">
              {formatNumber(getStatsValue())}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{getStatsLabel()}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default Rankings;