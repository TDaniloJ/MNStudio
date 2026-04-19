module.exports = (sequelize, DataTypes) => {
  const UserSubscription = sequelize.define('UserSubscription', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    plan_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'canceled', 'expired', 'pending'),
      defaultValue: 'pending',
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    end_date: {
      type: DataTypes.DATE,
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'user_subscriptions',
    timestamps: true,
    underscored: true,
  });

  UserSubscription.associate = (models) => {
    UserSubscription.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'plan_id',
    });

    UserSubscription.belongsTo(models.User, {
      foreignKey: 'user_id',
    });

    UserSubscription.hasMany(models.Payment, {
      foreignKey: 'subscription_id',
    });
  };

  return UserSubscription;
};