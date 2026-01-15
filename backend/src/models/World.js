module.exports = (sequelize, DataTypes) => {
  const World = sequelize.define('World', {
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
      comment: 'Continente, Planeta, Dimensão, etc'
    },
    description: {
      type: DataTypes.TEXT
    },
    image_url: {
      type: DataTypes.STRING(255)
    },
    climate: {
      type: DataTypes.STRING(100)
    },
    geography: {
      type: DataTypes.TEXT,
      comment: 'Descrição geográfica'
    },
    population: {
      type: DataTypes.BIGINT
    },
    races: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    languages: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    government: {
      type: DataTypes.STRING(100)
    },
    economy: {
      type: DataTypes.TEXT
    },
    culture: {
      type: DataTypes.TEXT
    },
    history: {
      type: DataTypes.TEXT
    },
    locations: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Locais importantes dentro do mundo'
    },
    resources: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Recursos naturais, minérios, etc'
    },
    dangers: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Perigos, monstros, zonas perigosas'
    },
    power_system: {
      type: DataTypes.TEXT,
      comment: 'Sistema de poder deste mundo'
    },
    laws: {
      type: DataTypes.TEXT,
      comment: 'Leis físicas ou mágicas do mundo'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'worlds',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  World.associate = (models) => {
    World.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return World;
};