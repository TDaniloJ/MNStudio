module.exports = (sequelize, DataTypes) => {
  const Character = sequelize.define('Character', {
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
    role: {
      type: DataTypes.STRING(50),
      comment: 'Protagonista, Antagonista, Mentor, etc'
    },
    age: {
      type: DataTypes.INTEGER
    },
    gender: {
      type: DataTypes.STRING(20)
    },
    race: {
      type: DataTypes.STRING(100),
      comment: 'Humano, Elfo, Dragão, etc'
    },
    image_url: {
      type: DataTypes.STRING(255)
    },
    appearance: {
      type: DataTypes.TEXT,
      comment: 'Descrição física'
    },
    personality: {
      type: DataTypes.TEXT,
      comment: 'Traços de personalidade'
    },
    background: {
      type: DataTypes.TEXT,
      comment: 'História de fundo'
    },
    strengths: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    weaknesses: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: []
    },
    abilities: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Lista de habilidades com descrições'
    },
    relationships: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Relacionamentos com outros personagens'
    },
    // Níveis e Poder
    power_level: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    cultivation_level: {
      type: DataTypes.STRING(100)
    },
    realm: {
      type: DataTypes.STRING(100),
      comment: 'Reino/Nível de cultivo atual'
    },
    // Stats
    strength: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    speed: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    intelligence: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    defense: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    mana: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    // Status
    status: {
      type: DataTypes.ENUM('alive', 'dead', 'unknown'),
      defaultValue: 'alive'
    },
    first_appearance: {
      type: DataTypes.STRING(50),
      comment: 'Capítulo de primeira aparição'
    },
    affiliation: {
      type: DataTypes.STRING(255),
      comment: 'Facção/Organização'
    },
    goals: {
      type: DataTypes.TEXT
    },
    notes: {
      type: DataTypes.TEXT,
      comment: 'Notas adicionais'
    }
  }, {
    tableName: 'characters',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Character.associate = (models) => {
    Character.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return Character;
};