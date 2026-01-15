module.exports = (sequelize, DataTypes) => {
  const Badge = sequelize.define('Badge', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon_url: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    condition_type: {
      type: DataTypes.ENUM('favorite_count', 'reading_streak', 'chapters_read', 'custom'),
      allowNull: false
    },
    condition_value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Valor necessário para desbloquear'
    },
    rarity: {
      type: DataTypes.ENUM('common', 'uncommon', 'rare', 'legendary'),
      defaultValue: 'common'
    }
  }, {
    tableName: 'badges',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Badge.associate = (models) => {
    Badge.belongsToMany(models.User, {
      through: models.UserBadge,
      as: 'users'
    });
  };

  return Badge;
};
