const db = require('./src/models');
require('dotenv').config();

const packages = [
  {
    name: 'Pacote Iniciante',
    amount: 20,
    bonus: 0,
    price: 0,
    highlight: false,
    display_order: 1
  },
  {
    name: 'Pacote Básico',
    amount: 50,
    bonus: 5,
    price: 9.90,
    highlight: false,
    display_order: 2
  },
  {
    name: 'Pacote Popular',
    amount: 120,
    bonus: 20,
    price: 19.90,
    highlight: true,
    display_order: 3
  },
  {
    name: 'Pacote Premium',
    amount: 300,
    bonus: 60,
    price: 39.90,
    highlight: false,
    display_order: 4
  },
  {
    name: 'Pacote Ultimate',
    amount: 600,
    bonus: 150,
    price: 69.90,
    highlight: false,
    display_order: 5
  }
];

async function populatePackages() {
  try {
    console.log('🔄 Populando pacotes de moedas...');

    for (const pkg of packages) {
      await db.CoinPackage.findOrCreate({
        where: { name: pkg.name },
        defaults: pkg
      });
    }

    console.log('✅ Pacotes criados com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

populatePackages();