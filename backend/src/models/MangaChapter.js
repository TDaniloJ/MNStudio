module.exports = (sequelize, DataTypes) => {
  const MangaChapter = sequelize.define('MangaChapter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    manga_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mangas',
        key: 'id'
      }
    },
    chapter_number: {
      type: DataTypes.DECIMAL(5, 1),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255)
    },
    views: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'manga_chapters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['manga_id', 'chapter_number']
      }
    ]
  });

  MangaChapter.associate = (models) => {
    MangaChapter.belongsTo(models.Manga, {
      foreignKey: 'manga_id',
      as: 'manga'
    });
    MangaChapter.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
    MangaChapter.hasMany(models.MangaPage, {
      foreignKey: 'chapter_id',
      as: 'pages'
    });
  };

  return MangaChapter;
};