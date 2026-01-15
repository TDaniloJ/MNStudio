module.exports = (sequelize, DataTypes) => {
  const Manga = sequelize.define('Manga', {
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
    artist: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.ENUM('ongoing', 'completed', 'hiatus'),
      defaultValue: 'ongoing'
    },
    type: {
      type: DataTypes.ENUM('manga', 'manhwa', 'manhua'),
      defaultValue: 'manga'
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
    tableName: 'mangas',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Manga.associate = (models) => {
    Manga.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
    Manga.hasMany(models.MangaChapter, {
      foreignKey: 'manga_id',
      as: 'chapters'
    });
    Manga.belongsToMany(models.Genre, {
      through: 'manga_genres',
      foreignKey: 'manga_id',
      otherKey: 'genre_id',
      as: 'genres'
    });
  };

  return Manga;
};