# 💡 Exemplos Práticos de Uso

## 1. Enviar Notificação de Favorito

### Quando usuário favorita uma obra:

```javascript
// backend/src/controllers/favoriteController.js

exports.addFavorite = async (req, res) => {
  try {
    const { novelId, mangaId } = req.body;
    const { userId } = req;

    // ... lógica de adicionar ao favorito ...

    const favorite = await Favorite.create({
      user_id: userId,
      novel_id: novelId,
      manga_id: mangaId
    });

    // 📢 ENVIAR NOTIFICAÇÃO
    await Notification.create({
      user_id: userId,
      type: 'favorite_update',
      title: '❤️ Adicionado aos Favoritos',
      message: `Você adicionou "${work.title}" aos seus favoritos!`,
      related_id: novelId || mangaId,
      related_type: novelId ? 'novel' : 'manga',
      action_url: novelId ? `/novels/${novelId}` : `/mangas/${mangaId}`
    });

    // 📊 REGISTRAR ATIVIDADE
    await Activity.create({
      user_id: userId,
      type: 'favorite_added',
      description: `Adicionou "${work.title}" aos favoritos`,
      related_id: novelId || mangaId,
      related_type: novelId ? 'novel' : 'manga'
    });

    res.json({ message: 'Adicionado aos favoritos', favorite });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
};
```

---

## 2. Detectar e Desbloquear Badges

### Quando usuário atinge 10 favoritos:

```javascript
// backend/src/utils/badgeUnlocker.js

async function checkAndUnlockBadges(userId) {
  const user = await User.findByPk(userId);
  
  // 1. Contar favoritos
  const favoriteCount = await Favorite.count({
    where: { user_id: userId }
  });

  // 2. Verificar e desbloquear badge de "Colecionador"
  if (favoriteCount >= 10) {
    const collectorBadge = await Badge.findOne({
      where: { condition_type: 'favorite_count', condition_value: 10 }
    });

    if (collectorBadge) {
      const [userBadge, created] = await UserBadge.findOrCreate({
        where: { user_id: userId, badge_id: collectorBadge.id }
      });

      if (created) {
        // 📢 NOTIFICAR USUÁRIO
        await Notification.create({
          user_id: userId,
          type: 'system',
          title: '🏆 Nova Conquista!',
          message: `Você desbloqueou a badge "${collectorBadge.name}"!`,
          related_id: collectorBadge.id,
          related_type: 'badge',
          action_url: '/profile?tab=achievements'
        });

        // 📊 REGISTRAR ATIVIDADE
        await Activity.create({
          user_id: userId,
          type: 'badge_earned',
          description: `Desbloqueou a badge "${collectorBadge.name}"`,
          related_id: collectorBadge.id,
          related_type: 'badge'
        });

        console.log(`✅ Badge "${collectorBadge.name}" desbloqueada para usuário ${userId}`);
      }
    }
  }
}
```

---

## 3. Registrar Leitura de Capítulo

### Quando usuário lê um capítulo:

```javascript
// backend/src/controllers/novelChapterController.js

exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req;
    const { chapterId } = req.params;

    const chapter = await NovelChapter.findByPk(chapterId, {
      include: { association: 'novel' }
    });

    // Registrar leitura
    const readingHistory = await ReadingHistory.create({
      user_id: userId,
      chapter_id: chapterId,
      novel_id: chapter.novel_id,
      completed_at: new Date()
    });

    // 📊 REGISTRAR ATIVIDADE
    await Activity.create({
      user_id: userId,
      type: 'chapter_read',
      description: `Leu o capítulo ${chapter.chapter_number}: "${chapter.title}" de "${chapter.novel.title}"`,
      related_id: chapterId,
      related_type: 'chapter',
      metadata: {
        novelId: chapter.novel_id,
        novelTitle: chapter.novel.title
      }
    });

    res.json({ message: 'Capítulo marcado como lido' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao marcar capítulo' });
  }
};
```

---

## 4. Frontend - Exibir Notificação Após Ação

```jsx
// frontend/src/pages/NovelReader.jsx

import { notificationService } from '../services/userEnhancementService';

const NovelReader = () => {
  const handleMarkAsRead = async () => {
    try {
      // ... marcar como lido ...
      
      // Atualizar notificações
      const data = await notificationService.getNotifications(false, 10);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      
      // Toast de confirmação
      toast.success('Capítulo marcado como lido!');
    } catch (error) {
      toast.error('Erro ao marcar capítulo');
    }
  };

  return (
    <div>
      {/* ... conteúdo do leitor ... */}
      <Button onClick={handleMarkAsRead}>
        Marcar como Lido
      </Button>
    </div>
  );
};
```

---

## 5. Admin - Enviar Notificação de Manutenção

```jsx
// frontend/src/components/admin/NotificationBroadcastPanel.jsx

const handleSendMaintenance = async () => {
  try {
    await notificationService.broadcastNotification({
      user_ids: [1, 2, 3, 4, 5],  // Ou buscar todos os usuários
      type: 'admin',
      title: '🔧 Manutenção Programada',
      message: 'O servidor estará em manutenção amanhã das 02:00 às 04:00. Por favor, salve seu trabalho.',
      action_url: null
    });

    toast.success('Notificação enviada para todos os usuários');
  } catch (error) {
    toast.error('Erro ao enviar notificação');
  }
};
```

---

## 6. Dashboard Admin - Ver Estatísticas

```javascript
// backend/src/controllers/adminController.js

exports.getNotificationStats = async (req, res) => {
  try {
    const totalNotifications = await Notification.count();
    const unreadNotifications = await Notification.count({
      where: { read_at: null }
    });

    const notificationsByType = await Notification.findAll({
      attributes: ['type', [sequelize.fn('COUNT', '*'), 'count']],
      group: ['type']
    });

    const badgesCreated = await Badge.count();
    const badgesUnlocked = await UserBadge.count();

    const activitiesLogged = await Activity.count();

    res.json({
      notifications: {
        total: totalNotifications,
        unread: unreadNotifications,
        byType: notificationsByType
      },
      badges: {
        total: badgesCreated,
        unlocked: badgesUnlocked
      },
      activities: {
        total: activitiesLogged
      }
    });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};
```

---

## 7. Frontend - Filtrar Atividades por Tipo

```jsx
// frontend/src/components/profile/ActivityLogView.jsx

const handleFilterChange = async (type) => {
  setFilter(type);
  try {
    setLoading(true);
    const filterType = type === 'all' ? null : type;
    const data = await activityService.getActivities(filterType, 50);
    setActivities(data.activities);
  } catch (error) {
    toast.error('Erro ao buscar atividades');
  } finally {
    setLoading(false);
  }
};

// Filtros disponíveis:
// - all: Todas as atividades
// - favorite_added: Favoritos adicionados
// - favorite_removed: Favoritos removidos
// - chapter_read: Capítulos lidos
// - badge_earned: Conquistas
```

---

## 8. Integração com Profile Update

```jsx
// frontend/src/pages/Profile.jsx

const handleProfileUpdate = async (data) => {
  try {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('email', data.email);
    formData.append('bio', bioText);  // 📝 Novo

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await authService.updateProfile(formData);
    updateUser(response.user);

    // 📁 Atualizar banner separadamente
    if (bannerFile) {
      const bannerFormData = new FormData();
      bannerFormData.append('banner', bannerFile);
      try {
        const bannerResponse = await authService.updateBanner(bannerFormData);
        updateUser(prev => ({ ...prev, banner_url: bannerResponse.banner_url }));
      } catch (error) {
        console.error('Erro ao atualizar banner:', error);
      }
    }

    toast.success('Perfil atualizado com sucesso!');
  } catch (error) {
    toast.error('Erro ao atualizar perfil');
  }
};
```

---

## 9. Exemplo: Seed de Badges

```javascript
// backend/scripts/seedBadges.js

const { Badge } = require('../src/models');

const defaultBadges = [
  {
    name: 'Primeiros Passos',
    description: 'Complete o seu perfil',
    icon_url: '/icons/badges/first-steps.svg',
    condition_type: 'custom',
    condition_value: null,
    rarity: 'common'
  },
  {
    name: 'Colecionador',
    description: 'Adicione 10 obras aos favoritos',
    icon_url: '/icons/badges/collector.svg',
    condition_type: 'favorite_count',
    condition_value: 10,
    rarity: 'uncommon'
  },
  {
    name: 'Leitor Dedicado',
    description: 'Leia 50 capítulos',
    icon_url: '/icons/badges/reader.svg',
    condition_type: 'chapters_read',
    condition_value: 50,
    rarity: 'rare'
  },
  {
    name: 'Fã do MN Studio',
    description: 'Acumule 100 dias de visitas',
    icon_url: '/icons/badges/fan.svg',
    condition_type: 'reading_streak',
    condition_value: 100,
    rarity: 'rare'
  },
  {
    name: 'Lenda',
    description: 'Desbloqueou todas as badges',
    icon_url: '/icons/badges/legend.svg',
    condition_type: 'custom',
    condition_value: null,
    rarity: 'legendary'
  }
];

async function seedBadges() {
  try {
    for (const badge of defaultBadges) {
      const [created] = await Badge.findOrCreate({
        where: { name: badge.name },
        defaults: badge
      });
      if (created) {
        console.log(`✅ Badge criada: ${badge.name}`);
      }
    }
    console.log('🎉 Seed de badges concluído!');
  } catch (error) {
    console.error('❌ Erro ao criar badges:', error);
  }
}

seedBadges();
```

---

## 10. Limpar Histórico (GDPR Compliant)

```javascript
// backend/src/controllers/activityController.js

exports.deleteAccount = async (req, res) => {
  try {
    const { userId } = req;

    // 1. Deletar todas as notificações
    await Notification.destroy({
      where: { user_id: userId }
    });

    // 2. Deletar todas as atividades
    await Activity.destroy({
      where: { user_id: userId }
    });

    // 3. Deletar todas as badges
    await UserBadge.destroy({
      where: { user_id: userId }
    });

    // 4. Deletar usuário (se desejar)
    await User.destroy({
      where: { id: userId }
    });

    res.json({ message: 'Conta deletada com sucesso (GDPR compliant)' });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: 'Erro ao deletar conta' });
  }
};
```

---

**Estes são exemplos práticos de como integrar os novos sistemas com funcionalidades existentes!** 🚀
