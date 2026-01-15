const { Novel, NovelChapter, Genre, User } = require('../models');
const { Op } = require('sequelize');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

exports.createNovel = async (req, res) => {
  try {
    console.log('📦 req.body:', req.body);
    console.log('📁 req.file:', req.file ? 'SIM' : 'NÃO');

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Dados não recebidos' });
    }

    const { title, alternative_titles, description, author, status, genres } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    let cover_image = null;

    if (req.file) {
      try {
        // Usar o caminho do arquivo já salvo
        cover_image = `/uploads/novel/${req.file.filename}`;
        console.log('✅ Imagem salva:', cover_image);
      } catch (err) {
        console.error('❌ Erro ao salvar imagem:', err);
      }
    }

    const novel = await Novel.create({
      title,
      alternative_titles: alternative_titles ? JSON.parse(alternative_titles) : [],
      description: description || '',
      cover_image,
      author,
      status,
      uploaded_by: req.userId
    });

    if (genres) {
      const genreIds = JSON.parse(genres);
      await novel.setGenres(genreIds);
    }

    const novelWithGenres = await Novel.findByPk(novel.id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: User, as: 'uploader', attributes: ['id', 'username'] }
      ]
    });

    res.status(201).json({
      message: 'Novel criada com sucesso',
      novel: novelWithGenres
    });
  } catch (error) {
    console.error('❌ Erro ao criar novel:', error);
    res.status(500).json({ error: error.message || 'Erro ao criar novel' });
  }
};

exports.getAllNovels = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, genre, sort = 'created_at' } = req.query;
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    if (status) {
      where.status = status;
    }

    const include = [
      { model: Genre, as: 'genres' },
      { model: User, as: 'uploader', attributes: ['id', 'username'] }
    ];

    if (genre) {
      include[0].where = { id: genre };
      include[0].required = true;
    }

    const order =
      sort === 'views' ? [['views', 'DESC']] :
      sort === 'rating' ? [['rating', 'DESC']] :
      [['created_at', 'DESC']];

    const { count, rows: novels } = await Novel.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order,
      distinct: true
    });

    res.json({
      novels,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar novels:', error);
    res.status(500).json({ error: 'Erro ao buscar novels' });
  }
};

exports.getNovelById = async (req, res) => {
  try {
    const { id } = req.params;

    const novel = await Novel.findByPk(id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: User, as: 'uploader', attributes: ['id', 'username'] },
        {
          model: NovelChapter,
          as: 'chapters',
          attributes: ['id', 'chapter_number', 'title', 'views', 'created_at'],
          order: [['chapter_number', 'ASC']]
        }
      ]
    });

    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    await novel.increment('views');

    res.json({ novel });
  } catch (error) {
    console.error('Erro ao buscar novel:', error);
    res.status(500).json({ error: 'Erro ao buscar novel' });
  }
};

exports.updateNovel = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, alternative_titles, description, author, status, genres } = req.body;

    const novel = await Novel.findByPk(id);
    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    if (req.user.role !== 'admin' && novel.uploaded_by !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão para editar esta novel' });
    }

    if (title) novel.title = title;
    if (alternative_titles) novel.alternative_titles = JSON.parse(alternative_titles);
    if (description) novel.description = description;
    if (author) novel.author = author;
    if (status) novel.status = status;

    if (req.file) {
      try {
        // Deletar imagem anterior se existir
        if (novel.cover_image) {
          const oldPath = path.join(__dirname, '../../', novel.cover_image);
          try {
            await fs.unlink(oldPath);
            console.log('🗑️ Imagem anterior deletada:', oldPath);
          } catch (err) {
            console.log('⚠️ Erro ao deletar imagem antiga (pode não existir):', err.message);
          }
        }

        // Com diskStorage, o arquivo JÁ ESTÁ SALVO - só usar o caminho
        const newCoverImage = `/uploads/novel/${req.file.filename}`;
        novel.cover_image = newCoverImage;
        console.log('✅ Nova imagem definida:', newCoverImage);
      } catch (imageError) {
        console.error('❌ Erro ao processar imagem:', imageError);
        // Não impedir a atualização por erro na imagem
      }
    }

    await novel.save();

    if (genres) {
      const genreIds = JSON.parse(genres);
      await novel.setGenres(genreIds);
    }

    const updatedNovel = await Novel.findByPk(id, {
      include: [
        { model: Genre, as: 'genres' },
        { model: User, as: 'uploader', attributes: ['id', 'username'] }
      ]
    });

    res.json({
      message: 'Novel atualizada com sucesso',
      novel: updatedNovel
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar novel:', error);
    res.status(500).json({ error: error.message || 'Erro ao atualizar novel' });
  }
};

exports.deleteNovel = async (req, res) => {
  try {
    const { id } = req.params;

    const novel = await Novel.findByPk(id);
    if (!novel) {
      return res.status(404).json({ error: 'Novel não encontrada' });
    }

    if (req.user.role !== 'admin' && novel.uploaded_by !== req.userId) {
      return res.status(403).json({ error: 'Sem permissão para deletar esta novel' });
    }

    if (novel.cover_image) {
      const imagePath = path.join(__dirname, '../../', novel.cover_image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.log('Erro ao deletar imagem:', err);
      }
    }

    await novel.destroy();

    res.json({ message: 'Novel deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar novel:', error);
    res.status(500).json({ error: 'Erro ao deletar novel' });
  }
};
