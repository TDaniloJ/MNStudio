import React, { useState, useEffect } from 'react';
import { Star, Lock, Trophy } from 'lucide-react';
import { badgeService } from '../services/userEnhancementService';
import Card from '../components/common/Card';

const AchievementsView = ({ userId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unlocked, locked

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const data = await badgeService.getUserBadges(userId);
      setBadges(data.badges);
    } catch (error) {
      console.error('Erro ao buscar badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter(badge => {
    if (filter === 'all') return true;
    if (filter === 'unlocked') return badge.unlocked;
    if (filter === 'locked') return !badge.unlocked;
    return true;
  });

  const rarityColors = {
    common: 'bg-gray-50 dark:bg-gray-800',
    uncommon: 'bg-green-50 dark:bg-green-900/10',
    rare: 'bg-blue-50 dark:bg-blue-900/10',
    legendary: 'bg-yellow-50 dark:bg-yellow-900/10'
  };

  const rarityBorderColors = {
    common: 'border-gray-200 dark:border-gray-700',
    uncommon: 'border-green-200 dark:border-green-700',
    rare: 'border-blue-200 dark:border-blue-700',
    legendary: 'border-yellow-200 dark:border-yellow-700'
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Conquistas
          </h3>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {badges.filter(b => b.unlocked).length} / {badges.length}
          </span>
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {['all', 'unlocked', 'locked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'unlocked' ? 'Desbloqueadas' : 'Bloqueadas'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin">
            <Star className="w-8 h-8 text-primary-600" />
          </div>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="text-center py-8 text-gray-600 dark:text-gray-400">
          <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma conquista nesta categoria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredBadges.map(badge => (
            <div
              key={badge.id}
              className={`p-4 rounded-lg border-2 transition ${
                badge.unlocked
                  ? rarityColors[badge.rarity] + ' ' + rarityBorderColors[badge.rarity]
                  : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 opacity-50'
              }`}
            >
              {/* Ícone/Imagem */}
              <div className="mb-3 text-center">
                {badge.icon_url ? (
                  <img
                    src={badge.icon_url}
                    alt={badge.name}
                    className="w-12 h-12 mx-auto"
                  />
                ) : (
                  <div className="w-12 h-12 mx-auto bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>

              {/* Nome */}
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white text-center line-clamp-2 mb-1">
                {badge.name}
              </h4>

              {/* Raridade */}
              <p className="text-xs text-center text-gray-600 dark:text-gray-400 mb-2">
                {badge.rarity === 'common' && '⚪ Comum'}
                {badge.rarity === 'uncommon' && '🟢 Incomum'}
                {badge.rarity === 'rare' && '🔵 Raro'}
                {badge.rarity === 'legendary' && '⭐ Lendário'}
              </p>

              {/* Status */}
              {badge.unlocked ? (
                <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                  ✅ Desbloqueado
                </p>
              ) : (
                <p className="text-xs text-center text-gray-500 dark:text-gray-500">
                  🔒 Bloqueado
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default AchievementsView;
