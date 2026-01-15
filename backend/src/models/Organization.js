module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
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
      comment: 'Seita, Clã, Guilda, Reino, etc'
    },
    description: {
      type: DataTypes.TEXT
    },
    image_url: {
      type: DataTypes.STRING(255)
    },
    leader: {
      type: DataTypes.STRING(255)
    },
    location: {
      type: DataTypes.STRING(255)
    },
    size: {
      type: DataTypes.STRING(50),
      comment: 'Pequena, Média, Grande, etc'
    },
    power_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    members: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Membros notáveis'
    },
    hierarchy: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Estrutura hierárquica'
    },
    resources: {
      type: DataTypes.TEXT
    },
    goals: {
      type: DataTypes.TEXT
    },
    allies: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    enemies: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    history: {
      type: DataTypes.TEXT
    },
    reputation: {
      type: DataTypes.STRING(50),
      comment: 'Reputação: Boa, Neutra, Má'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'organizations',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Organization.associate = (models) => {
    Organization.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return Organization;
};