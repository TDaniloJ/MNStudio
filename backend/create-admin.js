const bcrypt = require('bcryptjs');
const db = require('./src/models');
require('dotenv').config();

const createAdmin = async () => {
  try {
    const { User } = db;

    // Verificar se admin já existe
    const adminExists = await User.findOne({ 
      where: { email: 'admin@manga.com' } 
    });

    if (adminExists) {
      console.log('ℹ️  Usuário admin já existe');
      process.exit(0);
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('admin123', salt);

    // Criar admin
    await User.create({
      username: 'admin',
      email: 'admin@manga.com',
      password_hash,
      role: 'admin'
    });

    console.log('✅ Usuário admin criado com sucesso!');
    console.log('📧 Email: admin@manga.com');
    console.log('🔑 Senha: admin123');
    console.log('⚠️  Não esqueça de mudar a senha depois!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error);
    process.exit(1);
  }
};

createAdmin();