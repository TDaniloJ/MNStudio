module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define('SubscriptionPlan', {
    id: {
      type: DataTypes.STRING, // 'free', 'premium', etc
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
    period: {
      type: DataTypes.STRING, // 'month', 'year'
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
    },
    color: {
      type: DataTypes.STRING,
    },
    highlight: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 30,
    },
    coins_reward: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'subscription_plans',
    timestamps: true,
    underscored: true,
  });

  SubscriptionPlan.associate = (models) => {
    SubscriptionPlan.hasMany(models.UserSubscription, {
      foreignKey: 'plan_id',
    });

  SubscriptionPlan.hasMany(models.PlanFeature, {
    foreignKey: 'plan_id',
    as: 'features',
  });
  };

  return SubscriptionPlan;
};