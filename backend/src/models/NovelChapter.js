module.exports = (sequelize, DataTypes) => {
  const NovelChapter = sequelize.define('NovelChapter', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    novel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'novels',
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
    content: {
      type: DataTypes.TEXT,
      allowNull: false
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
    tableName: 'novel_chapters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['novel_id', 'chapter_number']
      }
    ]
  });

  NovelChapter.associate = (models) => {
    NovelChapter.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
    NovelChapter.belongsTo(models.User, {
      foreignKey: 'uploaded_by',
      as: 'uploader'
    });
  };

  return NovelChapter;
};