module.exports = (sequelize, DataTypes) => {
  const MagicSystem = sequelize.define('MagicSystem', {
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
      comment: 'Elemental, Runas, Divina, Demoníaca, etc'
    },
    description: {
      type: DataTypes.TEXT
    },
    source: {
      type: DataTypes.STRING(255),
      comment: 'Origem do poder: mana, chi, qi, etc'
    },
    rules: {
      type: DataTypes.TEXT,
      comment: 'Regras e limitações'
    },
    cost: {
      type: DataTypes.TEXT,
      comment: 'Custo de uso (mana, energia vital, etc)'
    },
    elements: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
      comment: 'Elementos: Fogo, Água, Terra, etc'
    },
    ranks: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Níveis/Rankings do sistema'
    },
    spells: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Feitiços/Técnicas disponíveis'
    },
    requirements: {
      type: DataTypes.TEXT,
      comment: 'Requisitos para usar'
    },
    weaknesses: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'magic_systems',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  MagicSystem.associate = (models) => {
    MagicSystem.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return MagicSystem;
};