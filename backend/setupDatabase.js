// setupDatabase.js
const { sequelize } = require('./src/models');
require('dotenv').config();

const setupDatabase = async () => {
  try {
    console.log('🔄 Conectando ao banco de dados...');
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco estabelecida');

    // Forçar recriação de todas as tabelas
    console.log('🔄 Recriando todas as tabelas...');
    await sequelize.sync({ force: true });
    console.log('✅ Todas as tabelas recriadas com sucesso');

    // Executar seeds
    console.log('🌱 Executando seeds...');
    await runSeeds();
    
    console.log('🎉 Banco de dados configurado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  }
};

const runSeeds = async () => {
  try {
    const { Genre } = require('./src/models');
    
    // Seed de gêneros (ajuste conforme seus dados)
    const genres = [
      { name: 'Ação', slug: 'acao' },
      { name: 'Aventura', slug: 'aventura' },
      { name: 'Comédia', slug: 'comedia' },
      { name: 'Drama', slug: 'drama' },
      { name: 'Fantasia', slug: 'fantasia' },
      { name: 'Ficção Científica', slug: 'ficcao-cientifica' },
      { name: 'Romance', slug: 'romance' },
      { name: 'Suspense', slug: 'suspense' },
      { name: 'Terror', slug: 'terror' },
      { name: 'Slice of Life', slug: 'slice-of-life' }
    ];

    await Genre.bulkCreate(genres);
    console.log(`✅ ${genres.length} gêneros inseridos`);
  } catch (error) {
    console.error('❌ Erro nos seeds:', error);
    throw error;
  }
};

setupDatabase();