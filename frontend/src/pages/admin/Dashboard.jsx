import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  Users, 
  Tag,
  TrendingUp,
  Plus,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mangaService } from '../../services/mangaService';
import { novelService } from '../../services/novelService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { formatNumber } from '../../utils/formatters';
import NotificationBroadcastPanel from '../../components/admin/NotificationBroadcastPanel';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMangas: 0,
    totalNovels: 0,
    totalViews: 0,
    recentMangas: [],
    recentNovels: []
  });
  const [loading, setLoading] = useState(true);
  const [chaptersCount, setChaptersCount] = useState({}); // ✅ Estado para contagem

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // ✅ CARREGA OS DADOS BÁSICOS PRIMEIRO
      const [mangasData, novelsData] = await Promise.all([
        mangaService.getAll({ limit: 5, sort: 'created_at' }),
        novelService.getAll({ limit: 5, sort: 'created_at' })
      ]);

      const totalViews = [
        ...(mangasData.mangas || []),
        ...(novelsData.novels || [])
      ].reduce((sum, item) => sum + (item.views || 0), 0);

      // ✅ SALVA OS DADOS INICIAIS
      setStats({
        totalMangas: mangasData.pagination?.total || mangasData.mangas?.length || 0,
        totalNovels: novelsData.pagination?.total || novelsData.novels?.length || 0,
        totalViews,
        recentMangas: mangasData.mangas || [],
        recentNovels: novelsData.novels || []
      });

      // ✅ CARREGA CONTAGEM DE CAPÍTULOS EM SEGUNDO PLANO (SEM BLOQUEAR A INTERFACE)
      loadChaptersCountInBackground(mangasData.mangas, novelsData.novels);

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  // ✅ FUNÇÃO PARA CARREGAR CONTAGEM EM BACKGROUND
  const loadChaptersCountInBackground = async (mangas, novels) => {
    try {
      const counts = {};

      // ✅ CARREGA CONTAGEM PARA MANGÁS
      if (mangas && mangas.length > 0) {
        for (const manga of mangas) {
          try {
            const chaptersData = await mangaService.getMangaChapters(manga.id);
            counts[`manga_${manga.id}`] = chaptersData.chapters?.length || 0;
          } catch (error) {
            console.warn(`⚠️ Não foi possível carregar capítulos do mangá ${manga.id}:`, error.message);
            counts[`manga_${manga.id}`] = 0;
          }
        }
      }

      // ✅ CARREGA CONTAGEM PARA NOVELS
      if (novels && novels.length > 0) {
        for (const novel of novels) {
          try {
            const chaptersData = await novelService.getNovelChapters(novel.id);
            counts[`novel_${novel.id}`] = chaptersData.chapters?.length || 0;
          } catch (error) {
            console.warn(`⚠️ Não foi possível carregar capítulos da novel ${novel.id}:`, error.message);
            counts[`novel_${novel.id}`] = 0;
          }
        }
      }

      setChaptersCount(counts);
    } catch (error) {
      console.error('Erro ao carregar contagem de capítulos:', error);
    }
  };


  
  // ✅ FUNÇÃO PARA OBTER CONTAGEM
  const getChaptersCount = (item, type) => {
    const key = `${type}_${item.id}`;
    return chaptersCount[key] !== undefined ? chaptersCount[key] : '...';
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
           <p className="text-gray-600 dark:text-gray-400">Visão geral do sistema</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/mangas/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Mangá
            </Button>
          </Link>
          <Link to="/admin/novels/new">
            <Button variant="secondary">
              <Plus className="w-4 h-4 mr-2" />
              Nova Novel
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 dark:text-white">
        <StatCard
          icon={BookOpen}
          label="Total de Mangás"
          value={stats.totalMangas}
          color="blue"
        />
        <StatCard
          icon={FileText}
          label="Total de Novels"
          value={stats.totalNovels}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Total de Visualizações"
          value={formatNumber(stats.totalViews)}
          color="purple"
        />
        <StatCard
          icon={BarChart3}
          label="Total de Conteúdos"
          value={stats.totalMangas + stats.totalNovels}
          color="orange"
        />
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Mangas */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mangás Recentes</h2>
            <Link
              to="/admin/mangas"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentMangas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum mangá encontrado
              </div>
            ) : (
              stats.recentMangas.map((manga) => (
                <ContentItem
                  key={manga.id}
                  item={manga}
                  type="manga"
                  chaptersCount={getChaptersCount(manga, 'manga')}
                  editUrl={`/admin/mangas/${manga.id}/edit`}
                />
              ))
            )}
          </div>
        </Card>

        {/* Recent Novels */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Novels Recentes</h2>
            <Link
              to="/admin/novels"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {stats.recentNovels.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhuma novel encontrada
              </div>
            ) : (
              stats.recentNovels.map((novel) => (
                <ContentItem
                  key={novel.id}
                  item={novel}
                  type="novel"
                  chaptersCount={getChaptersCount(novel, 'novel')}
                  editUrl={`/admin/novels/${novel.id}/edit`}
                />
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/mangas">
              <button className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition group">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <p className="font-medium text-gray-900 dark:text-white">Gerenciar Mangás</p>
            </button>
          </Link>
          <Link to="/admin/novels">
            <button className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition group">
              <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <p className="font-medium text-gray-900 dark:text-white">Gerenciar Novels</p>
            </button>
          </Link>
          <Link to="/admin/genres">
            <button className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition group">
              <Tag className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <p className="font-medium text-gray-900 dark:text-white">Gerenciar Gêneros</p>
            </button>
          </Link>
          <Link to="/admin/users">
              <button className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition group">
              <Users className="w-8 h-8 mx-auto mb-2 text-gray-600 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
              <p className="font-medium text-gray-900 dark:text-white">Gerenciar Usuários</p>
            </button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

// ✅ COMPONENTE PARA ITEM DE CONTEÚDO
const ContentItem = ({ item, type, chaptersCount, editUrl }) => {
  return (
    <Link
      to={editUrl}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition"
    >
      <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden flex-shrink-0">
        <img
          src={item.cover_image ? 
            `http://localhost:5000${item.cover_image}` : 
            'https://via.placeholder.com/100x150?text=No+Image'
          }
          alt={item.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/100x150?text=No+Image';
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 dark:text-white truncate">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {chaptersCount === '...' ? (
            <span className="text-gray-400 dark:text-gray-500">Carregando...</span>
          ) : (
            `${chaptersCount} capítulo${chaptersCount !== 1 ? 's' : ''}`
          )}
        </p>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {formatNumber(item.views || 0)} views
      </div>
    </Link>
  );
};

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/10 dark:text-blue-200',
    green: 'bg-green-100 text-green-600 dark:bg-green-900/10 dark:text-green-200',
    purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/10 dark:text-purple-200',
    orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/10 dark:text-orange-200'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </Card>
  );
};

{/* Admin Notifications */}

<NotificationBroadcastPanel />


export default Dashboard;