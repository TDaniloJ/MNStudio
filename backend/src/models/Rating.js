module.exports = (sequelize, DataTypes) => {
  const Rating = sequelize.define('Rating', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content_type: {
      type: DataTypes.STRING(32),
      allowNull: false
    },
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(2,1),
      allowNull: false
    }
  }, {
    tableName: 'ratings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['user_id', 'content_type', 'content_id'] }
    ]
  });

  Rating.associate = (models) => {
    Rating.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return Rating;
};
