import React, { useState, useEffect } from 'react';
import { Trash2, Calendar, Heart, BookOpen, Award, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import { activityService } from '../services/userEnhancementService';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const ActivityLogView = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, [userId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const type = filter === 'all' ? null : filter;
      const data = await activityService.getActivities(type, 50);
      setActivities(data.activities);
    } catch (error) {
      console.error('Erro ao buscar atividades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    try {
      await activityService.deleteActivity(activityId);
      setActivities(prev => prev.filter(a => a.id !== activityId));
      toast.success('Atividade deletada');
    } catch (error) {
      toast.error('Erro ao deletar atividade');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico de atividades?')) {
      return;
    }

    try {
      await activityService.clearActivities();
      setActivities([]);
      toast.success('Histórico limpo com sucesso');
    } catch (error) {
      toast.error('Erro ao limpar histórico');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'favorite_added':
      case 'favorite_removed':
        return <Heart className="w-5 h-5 text-red-500" />;
      case 'chapter_read':
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case 'novel_added':
      case 'manga_added':
        return <BookOpen className="w-5 h-5 text-primary-500" />;
      case 'badge_earned':
        return <Award className="w-5 h-5 text-yellow-500" />;
      default:
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'favorite_added':
      case 'favorite_removed':
        return 'text-red-700 dark:text-red-400';
      case 'chapter_read':
        return 'text-blue-700 dark:text-blue-400';
      case 'novel_added':
      case 'manga_added':
        return 'text-primary-700 dark:text-primary-400';
      case 'badge_earned':
        return 'text-yellow-700 dark:text-yellow-400';
      default:
        return 'text-gray-700 dark:text-gray-400';
    }
  };

  const activityTypes = [
    { id: 'all', label: 'Todas' },
    { id: 'favorite_added', label: 'Favoritos Adicionados' },
    { id: 'favorite_removed', label: 'Favoritos Removidos' },
    { id: 'chapter_read', label: 'Capítulos Lidos' },
    { id: 'badge_earned', label: 'Conquistas' }
  ];

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            Atividade Recente
          </h3>
          {activities.length > 0 && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleClearAll}
            >
              Limpar Tudo
            </Button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2 flex-wrap">
          {activityTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setFilter(type.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                filter === type.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <Calendar className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma atividade nesta categoria</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map(activity => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition group"
            >
              {/* Ícone */}
              <div className="flex-shrink-0 pt-1">
                {getActivityIcon(activity.type)}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(activity.created_at).toLocaleDateString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Botão de Deletar */}
              <button
                onClick={() => handleDeleteActivity(activity.id)}
                className="flex-shrink-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default ActivityLogView;
