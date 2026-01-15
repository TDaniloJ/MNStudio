const { Genre } = require('../models');

const genres = [
  'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia',
  'Romance', 'Horror', 'Mistério', 'Sci-Fi', 'Slice of Life',
  'Esportes', 'Sobrenatural', 'Psicológico', 'Seinen', 'Shounen',
  'Shoujo', 'Josei', 'Ecchi', 'Harem', 'Isekai',
  'Mecha', 'Militar', 'Musical', 'Policial', 'Histórico'
];

const seedGenres = async () => {
  try {
    for (const name of genres) {
      await Genre.findOrCreate({
        where: { name }
      });
    }
    console.log('✅ Gêneros populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular gêneros:', error);
  }
};

module.exports = seedGenres;