module.exports = (sequelize, DataTypes) => {
  const HelpRequest = sequelize.define('HelpRequest', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'help_requests',
    timestamps: true
  });

  HelpRequest.associate = (models) => {
    HelpRequest.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return HelpRequest;
};
