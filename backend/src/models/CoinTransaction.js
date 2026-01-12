module.exports = (sequelize, DataTypes) => {
  const CoinTransaction = sequelize.define('CoinTransaction', {
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
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('purchase', 'spend', 'bonus', 'refund'),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255)
    },
    reference_id: {
      type: DataTypes.STRING(100)
    },
    metadata: {
      type: DataTypes.JSONB
    }
  }, {
    tableName: 'coin_transactions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
  });

  CoinTransaction.associate = (models) => {
    CoinTransaction.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return CoinTransaction;
};