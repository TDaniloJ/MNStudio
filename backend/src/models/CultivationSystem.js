module.exports = (sequelize, DataTypes) => {
  const CultivationSystem = sequelize.define('CultivationSystem', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      comment: 'Marcial, Espiritual, Dual, etc'
    },
    description: {
      type: DataTypes.TEXT
    },
    levels: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Níveis de cultivo com descrições'
    },
    breakthrough_methods: {
      type: DataTypes.TEXT,
      comment: 'Como fazer breakthrough'
    },
    resources_needed: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Recursos necessários (pílulas, ervas, etc)'
    },
    time_required: {
      type: DataTypes.TEXT,
      comment: 'Tempo necessário por nível'
    },
    benefits: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Benefícios de cada nível'
    },
    dangers: {
      type: DataTypes.TEXT,
      comment: 'Perigos do cultivo'
    },
    techniques: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Técnicas de cultivo'
    },
    body_refinement: {
      type: DataTypes.TEXT,
      comment: 'Sistema de refinamento corporal'
    },
    soul_refinement: {
      type: DataTypes.TEXT,
      comment: 'Sistema de refinamento da alma'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'cultivation_systems',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  CultivationSystem.associate = (models) => {
    CultivationSystem.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return CultivationSystem;
};