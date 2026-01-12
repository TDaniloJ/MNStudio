module.exports = (sequelize, DataTypes) => {
  const UserBadge = sequelize.define('UserBadge', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    badge_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'user_badges',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  UserBadge.associate = (models) => {
    UserBadge.belongsTo(models.User, { foreignKey: 'user_id' });
    UserBadge.belongsTo(models.Badge, { foreignKey: 'badge_id' });
  };

  return UserBadge;
};
