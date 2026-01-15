module.exports = (sequelize, DataTypes) => {
  const Coin = sequelize.define('Coin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    balance: {
      type: DataTypes.INTEGER,
      defaultValue: 20,
      allowNull: false
    }
  }, {
    tableName: 'coins',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Coin.associate = (models) => {
    Coin.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Coin;
};