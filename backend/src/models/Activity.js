module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('favorite_added', 'favorite_removed', 'chapter_read', 'novel_added', 'manga_added', 'badge_earned'),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    related_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID da manga/novel/capítulo relacionado'
    },
    related_type: {
      type: DataTypes.ENUM('manga', 'novel', 'chapter', 'badge'),
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dados adicionais sobre a atividade'
    }
  }, {
    tableName: 'activities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Activity.associate = (models) => {
    Activity.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Activity;
};
