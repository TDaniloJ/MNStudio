module.exports = (sequelize, DataTypes) => {
  const Novel = sequelize.define('Novel', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    alternative_titles: {
      type: DataTypes.ARRAY(DataTypes.TEXT)
    },
    description: {
      type: DataTypes.TEXT
    },
    cover_image: {
      type: DataTypes.STRING(255)
    },
    author: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'completed', 'hiatus'),
      defaultValue: 'ongoing'
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0
    }
  }, {
    tableName: 'novels',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Novel.associate = (models) => {
    Novel.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
    Novel.hasMany(models.NovelChapter, {
      foreignKey: 'novel_id',
      as: 'chapters'
    });
    Novel.belongsToMany(models.Genre, {
      through: 'novel_genres',
      foreignKey: 'novel_id',
      otherKey: 'genre_id',
      as: 'genres'
    });
  };

  return Novel;
};