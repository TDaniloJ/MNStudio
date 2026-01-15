module.exports = (sequelize, DataTypes) => {
  const Timeline = sequelize.define('Timeline', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    novel_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'novels',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    date: {
      type: DataTypes.STRING(100),
      comment: 'Data no contexto da novel'
    },
    chapter: {
      type: DataTypes.STRING(50),
      comment: 'Capítulo onde ocorre'
    },
    description: {
      type: DataTypes.TEXT
    },
    type: {
      type: DataTypes.STRING(50),
      comment: 'Batalha, Encontro, Descoberta, etc'
    },
    participants: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    location: {
      type: DataTypes.STRING(255)
    },
    importance: {
      type: DataTypes.ENUM('baixa', 'média', 'alta', 'crítica'),
      defaultValue: 'média'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'timeline_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Timeline.associate = (models) => {
    Timeline.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return Timeline;
};