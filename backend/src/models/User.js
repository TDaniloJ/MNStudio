// models/User.js - ATUALIZADO
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'uploader', 'reader'),
      defaultValue: 'reader'
    },
    avatar_url: {
      type: DataTypes.STRING(255)
    },
    banner_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    google_sub: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    email_verified_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    two_factor_enabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    two_factor_secret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        email_notifications: true,
        push_notifications: false,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        theme: 'light'
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    subscription_plan: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
  }, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  User.associate = (models) => {
    User.hasMany(models.Manga, {
      foreignKey: 'uploaded_by',
      as: 'mangas'
    });
    User.hasMany(models.Novel, {
      foreignKey: 'uploaded_by',
      as: 'novels'
    });
    User.hasMany(models.Favorite, {
      foreignKey: 'user_id',
      as: 'favorites'
    });
    User.hasMany(models.ReadingHistory, {
      foreignKey: 'user_id',
      as: 'readingHistory'
    });
    User.hasMany(models.Comment, {
      foreignKey: 'user_id',
      as: 'comments'
    });
    User.hasMany(models.Session, {
      foreignKey: 'user_id',
      as: 'sessions'
    });
    User.hasMany(models.Notification, {
      foreignKey: 'user_id',
      as: 'notifications'
    });
    User.hasMany(models.Activity, {
      foreignKey: 'user_id',
      as: 'activities'
    });
    User.belongsToMany(models.Badge, {
      through: models.UserBadge,
      as: 'badges'
    });
    User.hasMany(models.UserSubscription, {
      foreignKey: 'user_id',
      as: 'subscriptions'
    });
  };

  return User;
};