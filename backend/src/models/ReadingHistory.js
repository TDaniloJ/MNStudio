module.exports = (sequelize, DataTypes) => {
  const ReadingHistory = sequelize.define('ReadingHistory', {
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
    content_type: {
      type: DataTypes.ENUM('manga', 'novel'),
      allowNull: false
    },
    content_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    chapter_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    last_page: {
      type: DataTypes.INTEGER
    }
  }, {
    tableName: 'reading_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  ReadingHistory.associate = (models) => {
    ReadingHistory.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return ReadingHistory;
};