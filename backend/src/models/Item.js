module.exports = (sequelize, DataTypes) => {
  const Item = sequelize.define('Item', {
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
      comment: 'Arma, Armadura, Pílula, Artefato, etc'
    },
    rarity: {
      type: DataTypes.ENUM('comum', 'incomum', 'raro', 'épico', 'lendário', 'mítico'),
      defaultValue: 'comum'
    },
    image_url: {
      type: DataTypes.STRING(255)
    },
    description: {
      type: DataTypes.TEXT
    },
    effects: {
      type: DataTypes.TEXT,
      comment: 'Efeitos do item'
    },
    requirements: {
      type: DataTypes.TEXT,
      comment: 'Requisitos para usar'
    },
    stats: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Atributos: ataque, defesa, etc'
    },
    origin: {
      type: DataTypes.TEXT,
      comment: 'Origem/História do item'
    },
    current_owner: {
      type: DataTypes.STRING(255),
      comment: 'Dono atual'
    },
    price: {
      type: DataTypes.STRING(100),
      comment: 'Valor/Preço'
    },
    notes: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Item.associate = (models) => {
    Item.belongsTo(models.Novel, {
      foreignKey: 'novel_id',
      as: 'novel'
    });
  };

  return Item;
};