const { ReadingHistory, Manga, Novel, MangaChapter, NovelChapter } = require('../models');

exports.saveReadingProgress = async (req, res) => {
  try {
    const { content_type, content_id, chapter_id, last_page } = req.body;

    const [history, created] = await ReadingHistory.findOrCreate({
      where: {
        user_id: req.userId,
        content_type,
        content_id
      },
      defaults: {
        chapter_id,
        last_page
      }
    });

    if (!created) {
      history.chapter_id = chapter_id;
      history.last_page = last_page;
      await history.save();
    }

    res.json({
      message: 'Progresso salvo',
      history
    });
  } catch (error) {
    console.error('Erro ao salvar progresso:', error);
    res.status(500).json({ error: 'Erro ao salvar progresso' });
  }
};

exports.getReadingHistory = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const history = await ReadingHistory.findAll({
      where: { user_id: req.userId },
      order: [['updated_at', 'DESC']],
      limit: parseInt(limit)
    });

    // Separar por tipo
    const mangaHistory = history.filter(h => h.content_type === 'manga');
    const novelHistory = history.filter(h => h.content_type === 'novel');

    // Buscar detalhes
    const mangaIds = mangaHistory.map(h => h.content_id);
    const novelIds = novelHistory.map(h => h.content_id);

    const mangas = await Manga.findAll({
      where: { id: mangaIds },
      include: [{
        model: MangaChapter,
        as: 'chapters',
        attributes: ['id', 'chapter_number', 'title']
      }]
    });

    const novels = await Novel.findAll({
      where: { id: novelIds },
      include: [{
        model: NovelChapter,
        as: 'chapters',
        attributes: ['id', 'chapter_number', 'title']
      }]
    });

    // Combinar dados
    const mangaData = mangaHistory.map(h => {
      const manga = mangas.find(m => m.id === h.content_id);
      const chapter = manga?.chapters.find(c => c.id === h.chapter_id);
      return {
        ...h.toJSON(),
        manga,
        current_chapter: chapter
      };
    });

    const novelData = novelHistory.map(h => {
      const novel = novels.find(n => n.id === h.content_id);
      const chapter = novel?.chapters.find(c => c.id === h.chapter_id);
      return {
        ...h.toJSON(),
        novel,
        current_chapter: chapter
      };
    });

    res.json({
      history: {
        mangas: mangaData,
        novels: novelData
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await ReadingHistory.destroy({
      where: { user_id: req.userId }
    });

    res.json({ message: 'Histórico limpo com sucesso' });
  } catch (error) {
    console.error('Erro ao limpar histórico:', error);
    res.status(500).json({ error: 'Erro ao limpar histórico' });
  }
};