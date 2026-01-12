const bcrypt = require('bcryptjs');
const db = require('./src/models');
require('dotenv').config();

const createTestUser = async () => {
  try {
    const { User } = db;

    // Dados de teste
    const email = 'user@example.com';
    const password = 'password123';

    // Verificar se já existe
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      console.log('✅ Usuário de teste já existe');
      process.exit(0);
    }

    // Hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Criar usuário
    await User.create({
      username: 'testuser',
      email: email,
      password_hash,
      role: 'reader',
      email_verified_at: null
    });

    console.log('✅ Usuário de teste criado com sucesso');
    console.log('Email:', email);
    console.log('Senha:', password);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
};

createTestUser();
