// models/MangaPage.js
module.exports = (sequelize, DataTypes) => {
  const MangaPage = sequelize.define('MangaPage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'manga_chapters',
        key: 'id'
      }
    },
    page_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    image_url: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    // ✅ COLUNAS ADICIONADAS
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'manga_pages',
    timestamps: true, // ✅ AGORA TRUE para gerenciar automaticamente
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['chapter_id', 'page_number']
      }
    ]
  });

  MangaPage.associate = (models) => {
    MangaPage.belongsTo(models.MangaChapter, {
      foreignKey: 'chapter_id',
      as: 'chapter'
    });
  };

  return MangaPage;
};