module.exports = (sequelize, DataTypes) => {
  const Settings = sequelize.define('Settings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('text', 'textarea', 'number', 'boolean', 'color', 'image', 'json'),
      defaultValue: 'text'
    },
    category: {
      type: DataTypes.STRING(50),
      defaultValue: 'general'
    },
    description: {
      type: DataTypes.STRING(255)
    }
  }, {
    tableName: 'settings',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return Settings;
};