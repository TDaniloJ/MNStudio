const { HelpCenter } = require('../models');

module.exports = (sequelize, DataTypes) => {
  const HelpCenter = sequelize.define('HelpCenter', {
    question: {
      type: DataTypes.STRING,
      allowNull: false
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'help_centers',
    timestamps: true
  });

  HelpCenter.associate = (models) => {
    // futuras associações, se quiser
  };

  return HelpCenter;
};
