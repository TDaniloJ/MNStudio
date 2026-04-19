module.exports = (sequelize, DataTypes) => {
  const PlanFeature = sequelize.define('PlanFeature', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    plan_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('feature', 'limitation'),
      defaultValue: 'feature',
    },
  }, {
    tableName: 'plan_features',
    timestamps: false,
    underscored: true,
  });

  PlanFeature.associate = (models) => {
    PlanFeature.belongsTo(models.SubscriptionPlan, {
      foreignKey: 'plan_id',
    });
  };

  return PlanFeature;
};