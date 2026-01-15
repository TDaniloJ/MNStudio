const { Genre } = require('../models');

exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    const genre = await Genre.create({ name });

    res.status(201).json({
      message: 'Gênero criado com sucesso',
      genre
    });
  } catch (error) {
    console.error('Erro ao criar gênero:', error);
    res.status(500).json({ error: 'Erro ao criar gênero' });
  }
};

exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.findAll({
      order: [['name', 'ASC']]
    });

    res.json({ genres });
  } catch (error) {
    console.error('Erro ao buscar gêneros:', error);
    res.status(500).json({ error: 'Erro ao buscar gêneros' });
  }
};

exports.deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;

    const genre = await Genre.findByPk(id);
    if (!genre) {
      return res.status(404).json({ error: 'Gênero não encontrado' });
    }

    await genre.destroy();

    res.json({ message: 'Gênero deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar gênero:', error);
    res.status(500).json({ error: 'Erro ao deletar gênero' });
  }
};