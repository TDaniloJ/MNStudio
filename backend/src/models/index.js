// models/index.js - ATUALIZADO
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

const db = {
  sequelize,
  Sequelize,
};

// Importar models
db.User = require('./User')(sequelize, Sequelize);
db.Manga = require('./Manga')(sequelize, Sequelize);
db.Novel = require('./Novel')(sequelize, Sequelize);
db.MangaChapter = require('./MangaChapter')(sequelize, Sequelize);
db.NovelChapter = require('./NovelChapter')(sequelize, Sequelize);
db.MangaPage = require('./MangaPage')(sequelize, Sequelize);
db.Rating = require('./Rating')(sequelize, Sequelize);
db.Genre = require('./Genre')(sequelize, Sequelize);
db.Favorite = require('./Favorite')(sequelize, Sequelize);
db.ReadingHistory = require('./ReadingHistory')(sequelize, Sequelize);
db.Comment = require('./Comment')(sequelize, Sequelize);
db.Session = require('./Session')(sequelize, Sequelize);
db.Settings = require('./Settings')(sequelize, Sequelize);
db.Coin = require('./Coin')(sequelize, Sequelize);
db.CoinTransaction = require('./CoinTransaction')(sequelize, Sequelize);
db.CoinPackage = require('./CoinPackage')(sequelize, Sequelize);

// ✅ ADICIONAR NOVOS MODELS DE WORLDBUILDING
db.Character = require('./Character')(sequelize, Sequelize);
db.World = require('./World')(sequelize, Sequelize);
db.MagicSystem = require('./MagicSystem')(sequelize, Sequelize);
db.CultivationSystem = require('./CultivationSystem')(sequelize, Sequelize);
db.Item = require('./Item')(sequelize, Sequelize);
db.Organization = require('./Organization')(sequelize, Sequelize);
db.Timeline = require('./Timeline')(sequelize, Sequelize);

// ✅ ADICIONAR NOVOS MODELS DE NOTIFICAÇÕES E ACHIEVEMENTS
db.Notification = require('./Notification')(sequelize, Sequelize);
db.Badge = require('./Badge')(sequelize, Sequelize);
db.Activity = require('./Activity')(sequelize, Sequelize);
db.UserBadge = require('./UserBadge')(sequelize, Sequelize);

// ✅ ADICIONAR NOVOS MODELS DE HELP CENTER E HELP REQUESTS
db.HelpCenter = require('./HelpCenter')(sequelize, Sequelize);
db.HelpRequest = require('./HelpRequest')(sequelize, Sequelize);

// Definir associações
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;