const { Favorite, Manga, Novel } = require('../models');

exports.addFavorite = async (req, res) => {
  try {
    const { content_type, content_id } = req.body;

    // Verificar se conteúdo existe
    if (content_type === 'manga') {
      const manga = await Manga.findByPk(content_id);
      if (!manga) {
        return res.status(404).json({ error: 'Mangá não encontrado' });
      }
    } else if (content_type === 'novel') {
      const novel = await Novel.findByPk(content_id);
      if (!novel) {
        return res.status(404).json({ error: 'Novel não encontrada' });
      }
    }

    const [favorite, created] = await Favorite.findOrCreate({
      where: {
        user_id: req.userId,
        content_type,
        content_id
      }
    });

    if (!created) {
      return res.status(400).json({ error: 'Já está nos favoritos' });
    }

    res.status(201).json({
      message: 'Adicionado aos favoritos',
      favorite
    });
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error);
    res.status(500).json({ error: 'Erro ao adicionar favorito' });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    const { content_type, content_id } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: req.userId,
        content_type,
        content_id
      }
    });

    if (!favorite) {
      return res.status(404).json({ error: 'Favorito não encontrado' });
    }

    await favorite.destroy();

    res.json({ message: 'Removido dos favoritos' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
};

exports.getUserFavorites = async (req, res) => {
  try {
    const { type } = req.query;
    const where = { user_id: req.userId };

    if (type) {
      where.content_type = type;
    }

    const favorites = await Favorite.findAll({ where });

    // Buscar detalhes dos conteúdos
    const mangaIds = favorites.filter(f => f.content_type === 'manga').map(f => f.content_id);
    const novelIds = favorites.filter(f => f.content_type === 'novel').map(f => f.content_id);

    const mangas = await Manga.findAll({
      where: { id: mangaIds },
      attributes: ['id', 'title', 'cover_image', 'status', 'rating']
    });

    const novels = await Novel.findAll({
      where: { id: novelIds },
      attributes: ['id', 'title', 'cover_image', 'status', 'rating']
    });

    res.json({
      favorites: {
        mangas,
        novels
      }
    });
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const { type, id } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: req.userId,
        content_type: type,
        content_id: id
      }
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Erro ao verificar favorito:', error);
    res.status(500).json({ error: 'Erro ao verificar favorito' });
  }
};
