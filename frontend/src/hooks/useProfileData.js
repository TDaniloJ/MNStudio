import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';
import { activityService } from '../services/activityService';
import { badgeService } from '../services/userEnhancementService';
import { favoriteService } from '../services/favoriteService';

/**
 * Hook centralizado para carregar todos os dados do perfil.
 * Separa responsabilidades de fetch do componente principal.
 */
export function useProfileData(userId) {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [favorites, setFavorites] = useState({ mangas: [], novels: [] });

  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  useEffect(() => {
    async function loadStats() {
      setLoadingStats(true);
      try {
        const data = await statsService.getMyStats();
        setStats(data);
      } catch (err) {
        console.error('Erro ao carregar stats:', err);
      } finally {
        setLoadingStats(false);
      }
    }
    loadStats();
  }, []);

  useEffect(() => {
    if (!userId) return;

    async function loadActivity() {
      setLoadingActivity(true);
      try {
        const data = await activityService.getMyActivity();
        setActivity(data);
      } catch (err) {
        console.error('Erro ao carregar atividade:', err);
      } finally {
        setLoadingActivity(false);
      }
    }
    loadActivity();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    async function loadAchievements() {
      setLoadingAchievements(true);
      try {
        const data = await badgeService.getUserBadges(userId);
        setAchievements(Array.isArray(data?.badges) ? data.badges : []);
      } catch (err) {
        console.error('Erro ao carregar conquistas:', err);
      } finally {
        setLoadingAchievements(false);
      }
    }
    loadAchievements();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    async function loadFavorites() {
      setLoadingFavorites(true);
      try {
        const data = await favoriteService.getUserFavorites();
        setFavorites(data?.favorites || { mangas: [], novels: [] });
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      } finally {
        setLoadingFavorites(false);
      }
    }
    loadFavorites();
  }, [userId]);

  return {
    stats,
    activity,
    achievements,
    favorites,
    loading: {
      stats: loadingStats,
      activity: loadingActivity,
      achievements: loadingAchievements,
      favorites: loadingFavorites,
    },
  };
}
