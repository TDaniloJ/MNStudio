require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// Criar conexão
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

// Importar todos os models manualmente
const User = require('./src/models/User')(sequelize, DataTypes);
const Genre = require('./src/models/Genre')(sequelize, DataTypes);
const Manga = require('./src/models/Manga')(sequelize, DataTypes);
const Novel = require('./src/models/Novel')(sequelize, DataTypes);
const MangaChapter = require('./src/models/MangaChapter')(sequelize, DataTypes);
const NovelChapter = require('./src/models/NovelChapter')(sequelize, DataTypes);
const MangaPage = require('./src/models/MangaPage')(sequelize, DataTypes);
const Favorite = require('./src/models/Favorite')(sequelize, DataTypes);
const ReadingHistory = require('./src/models/ReadingHistory')(sequelize, DataTypes);
const Comment = require('./src/models/Comment')(sequelize, DataTypes);
const Settings = require('./src/models/Settings')(sequelize, DataTypes);
const Session = require('./src/models/Session')(sequelize, DataTypes);
const Character = require('./src/models/Character')(sequelize, DataTypes);
const World = require('./src/models/World')(sequelize, DataTypes);
const Timeline = require('./src/models/Timeline')(sequelize, DataTypes);
const Organization = require('./src/models/Organization')(sequelize, DataTypes);
const Item = require('./src/models/Item')(sequelize, DataTypes);
const CultivationSystem = require('./src/models/CultivationSystem')(sequelize, DataTypes);
const MagicSystem = require('./src/models/MagicSystem')(sequelize, DataTypes);
const Notification = require('./src/models/Notification')(sequelize, DataTypes);
const Badge = require('./src/models/Badge')(sequelize, DataTypes);
const Activity = require('./src/models/Activity')(sequelize, DataTypes);
const UserBadge = require('./src/models/UserBadge')(sequelize, DataTypes);
const seedSettings = require('./src/utils/seedSettings');
const Coin = require('./src/models/Coin')(sequelize, DataTypes);
const CoinPackage = require('./src/models/CoinPackage')(sequelize, DataTypes);
const CoinTransaction = require('./src/models/CoinTransaction')(sequelize, DataTypes);
const Rating = require('./src/models/Rating')(sequelize, DataTypes);


// Objeto com todos os models
const models = {
  User,
  Genre,
  Manga,
  Novel,
  MangaChapter,
  NovelChapter,
  MangaPage,
  Favorite,
  ReadingHistory,
  Comment,
  Settings,
  Session,
  Character,
  World,
  Timeline,
  Organization,
  Item,
  CultivationSystem,
  MagicSystem,
  Notification,
  Badge,
  Activity,
  UserBadge,
  Coin,
  CoinPackage,
  CoinTransaction
};

// Configurar associações
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

const syncDatabase = async () => {
  try {
    console.log('🔄 Iniciando sincronização do banco de dados...');
    
    // Testar conexão
    await sequelize.authenticate();
    console.log('✅ Conexão com PostgreSQL estabelecida');

    // Sincronizar tabelas na ordem correta (respeitando foreign keys)
    console.log('🔄 Criando tabelas...');
    
    await User.sync({ alter: true });
    console.log('✅ Tabela users criada');
    
    await Genre.sync({ alter: true });
    console.log('✅ Tabela genres criada');
    
    await Manga.sync({ alter: true });
    console.log('✅ Tabela mangas criada');
    
    await Novel.sync({ alter: true });
    console.log('✅ Tabela novels criada');
    
    await MangaChapter.sync({ alter: true });
    console.log('✅ Tabela manga_chapters criada');
    
    await NovelChapter.sync({ alter: true });
    console.log('✅ Tabela novel_chapters criada');
    
    await MangaPage.sync({ alter: true });
    console.log('✅ Tabela manga_pages criada');
    
    await Favorite.sync({ alter: true });
    console.log('✅ Tabela favorites criada');
    
    await ReadingHistory.sync({ alter: true });
    console.log('✅ Tabela reading_history criada');
    
    await Comment.sync({ alter: true });
    console.log('✅ Tabela comments criada');

    await Settings.sync({ alter: true });
    console.log('✅ Tabela settings criada');

    await Session.sync({ alter: true });
    console.log('✅ Tabela sessions criada');

    await Character.sync({ alter: true });
    console.log('✅ Tabela characters criada');

    await World.sync({ alter: true });
    console.log('✅ Tabela worlds criada');

    await Timeline.sync({ alter: true });
    console.log('✅ Tabela timelines criada');

    await Organization.sync({ alter: true });
    console.log('✅ Tabela organizations criada');

    await Item.sync({ alter: true });
    console.log('✅ Tabela items criada');

    await CultivationSystem.sync({ alter: true });
    console.log('✅ Tabela cultivation_systems criada');

    await MagicSystem.sync({ alter: true });
    console.log('✅ Tabela magic_systems criada');

    await Notification.sync({ alter: true });
    console.log('✅ Tabela notifications criada');

    await Badge.sync({ alter: true });
    console.log('✅ Tabela badges criada');

    await Activity.sync({ alter: true });
    console.log('✅ Tabela activities criada');

    await UserBadge.sync({ alter: true });
    console.log('✅ Tabela user_badges criada');

      await Rating.sync({ alter: true });
      console.log('✅ Tabela ratings criada');

    // ===== SISTEMA DE MOEDAS =====

    await CoinPackage.sync({ alter: true });
    console.log('✅ Tabela coin_packages criada');

    await Coin.sync({ alter: true });
    console.log('✅ Tabela coins criada');

    await CoinTransaction.sync({ alter: true });
    console.log('✅ Tabela coin_transactions criada');


    // Criar tabelas de junção (many-to-many)
    await sequelize.queryInterface.createTable('manga_genres', {
      manga_id: {
        type: DataTypes.INTEGER,
        references: { model: 'mangas', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      genre_id: {
        type: DataTypes.INTEGER,
        references: { model: 'genres', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }).catch(err => {
      if (err.original?.code !== '42P07') throw err; // Ignora se já existe
    });
    console.log('✅ Tabela manga_genres criada');

    await sequelize.queryInterface.createTable('novel_genres', {
      novel_id: {
        type: DataTypes.INTEGER,
        references: { model: 'novels', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      genre_id: {
        type: DataTypes.INTEGER,
        references: { model: 'genres', key: 'id' },
        onDelete: 'CASCADE',
        primaryKey: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    }).catch(err => {
      if (err.original?.code !== '42P07') throw err; // Ignora se já existe
    });
    console.log('✅ Tabela novel_genres criada');

const seedCoinPackages = async () => {
  const packages = [
    {
      name: 'Pacote Iniciante',
      amount: 20,
      bonus: 0,
      price: 0,
      highlight: false,
      display_order: 1
    },
    {
      name: 'Pacote Básico',
      amount: 50,
      bonus: 5,
      price: 9.90,
      highlight: false,
      display_order: 2
    },
    {
      name: 'Pacote Popular',
      amount: 120,
      bonus: 20,
      price: 19.90,
      highlight: true,
      display_order: 3
    },
    {
      name: 'Pacote Premium',
      amount: 300,
      bonus: 60,
      price: 39.90,
      highlight: false,
      display_order: 4
    },
    {
      name: 'Pacote Ultimate',
      amount: 600,
      bonus: 150,
      price: 69.90,
      highlight: false,
      display_order: 5
    }
  ];

  let count = 0;
  for (const pkg of packages) {
    const [, created] = await CoinPackage.findOrCreate({
      where: { name: pkg.name },
      defaults: pkg
    });
    if (created) count++;
  }

  console.log(`✅ ${count} pacotes de moedas inseridos`);
};


    console.log('✅ Todas as tabelas foram criadas com sucesso!');

    // Popular gêneros
    console.log('🔄 Populando gêneros...');
    await populateGenres();

    // Popular configurações
    console.log('🔄 Populando configurações...');
    await seedSettings();

    console.log('✅ Banco de dados totalmente configurado!');
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao sincronizar banco de dados:', error);
    await sequelize.close();
    process.exit(1);
  }
};

const populateGenres = async () => {
  const genres = [
    'Ação', 'Aventura', 'Comédia', 'Drama', 'Fantasia',
    'Romance', 'Horror', 'Mistério', 'Sci-Fi', 'Slice of Life',
    'Esportes', 'Sobrenatural', 'Psicológico', 'Seinen', 'Shounen',
    'Shoujo', 'Josei', 'Ecchi', 'Harem', 'Isekai',
    'Mecha', 'Militar', 'Musical', 'Policial', 'Histórico',
    'Thriller', 'Suspense', 'Maduro', 'Escolar', 'Vida Diária'
  ];

  let count = 0;
  for (const name of genres) {
    const [genre, created] = await Genre.findOrCreate({
      where: { name },
      defaults: { name }
    });
    if (created) count++;
  }

  console.log(`✅ ${count} gêneros inseridos (${genres.length} total no banco)!`);
};

(async () => {
  await syncDatabase();
})();