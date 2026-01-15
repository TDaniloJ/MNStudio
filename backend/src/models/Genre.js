module.exports = (sequelize, DataTypes) => {
  const Genre = sequelize.define('Genre', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    }
  }, {
    tableName: 'genres',
    timestamps: false
  });

  Genre.associate = (models) => {
    Genre.belongsToMany(models.Manga, {
      through: 'manga_genres',
      foreignKey: 'genre_id',
      otherKey: 'manga_id',
      as: 'mangas'
    });
    Genre.belongsToMany(models.Novel, {
      through: 'novel_genres',
      foreignKey: 'genre_id',
      otherKey: 'novel_id',
      as: 'novels'
    });
  };

  return Genre;
};