const { Coin, CoinTransaction, CoinPackage, User } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

// Obter saldo do usuário
exports.getBalance = catchAsync(async (req, res, next) => {
  let coinAccount = await Coin.findOne({
    where: { user_id: req.userId }
  });

  if (!coinAccount) {
    coinAccount = await Coin.create({
      user_id: req.userId,
      balance: 20
    });
    logger.info('Conta de moedas criada com saldo inicial', { userId: req.userId });
  }

  res.json({
    balance: coinAccount.balance
  });
});

// Obter histórico de transações
exports.getTransactions = catchAsync(async (req, res, next) => {
  const { limit = 50 } = req.query;

  const transactions = await CoinTransaction.findAll({
    where: { user_id: req.userId },
    order: [['created_at', 'DESC']],
    limit: parseInt(limit)
  });

  logger.debug('Transações recuperadas', {
    userId: req.userId,
    count: transactions.length
  });

  res.json({ transactions });
});

// Listar pacotes disponíveis
exports.getPackages = catchAsync(async (req, res, next) => {
  const packages = await CoinPackage.findAll({
    where: { is_active: true },
    order: [['display_order', 'ASC'], ['price', 'ASC']]
  });

  logger.debug('Pacotes listados', { count: packages.length });

  res.json({ packages });
});

// Comprar pacote
exports.purchasePackage = catchAsync(async (req, res, next) => {
  const { package_id, payment_method } = req.body;

  if (!package_id) {
    throw new AppError('package_id é obrigatório', 400, 'MISSING_FIELDS');
  }

  const pkg = await CoinPackage.findByPk(package_id);
  if (!pkg || !pkg.is_active) {
    throw new AppError('Pacote não encontrado ou inativo', 404, 'NOT_FOUND', {
      resource: 'package',
      id: package_id
    });
  }

  const totalCoins = pkg.amount + pkg.bonus;

  // Atualizar saldo
  let coinAccount = await Coin.findOne({
    where: { user_id: req.userId }
  });

  if (!coinAccount) {
    coinAccount = await Coin.create({
      user_id: req.userId,
      balance: totalCoins
    });
  } else {
    coinAccount.balance += totalCoins;
    await coinAccount.save();
  }

  // Registrar transação
  await CoinTransaction.create({
    user_id: req.userId,
    amount: totalCoins,
    type: 'purchase',
    description: `Compra: ${pkg.name}`,
    reference_id: `PKG-${pkg.id}-${Date.now()}`,
    metadata: {
      package_id: pkg.id,
      package_name: pkg.name,
      base_amount: pkg.amount,
      bonus_amount: pkg.bonus,
      price: pkg.price,
      payment_method
    }
  });

  logger.info('Pacote comprado', {
    userId: req.userId,
    packageId: package_id,
    packageName: pkg.name,
    coinsAdded: totalCoins,
    newBalance: coinAccount.balance
  });

  res.json({
    success: true,
    new_balance: coinAccount.balance,
    coins_added: totalCoins,
    message: `${totalCoins} moedas adicionadas com sucesso!`
  });
});

// Gastar moedas
exports.spendCoins = catchAsync(async (req, res, next) => {
  const { amount, description, reference_id, metadata } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Valor deve ser maior que 0', 400, 'INVALID_AMOUNT', { amount });
  }

  const coinAccount = await Coin.findOne({
    where: { user_id: req.userId }
  });

  if (!coinAccount || coinAccount.balance < amount) {
    throw new AppError('Saldo insuficiente', 400, 'INSUFFICIENT_BALANCE', {
      required: amount,
      available: coinAccount?.balance || 0
    });
  }

  // Descontar moedas
  coinAccount.balance -= amount;
  await coinAccount.save();

  // Registrar transação
  await CoinTransaction.create({
    user_id: req.userId,
    amount: -amount,
    type: 'spend',
    description: description || 'Uso de recurso',
    reference_id,
    metadata
  });

  logger.info('Moedas gastas', {
    userId: req.userId,
    amount,
    newBalance: coinAccount.balance,
    reference: reference_id
  });

  res.json({
    success: true,
    new_balance: coinAccount.balance,
    coins_spent: amount
  });
});

// Adicionar bônus (admin)
exports.addBonus = catchAsync(async (req, res, next) => {
  const { user_id, amount, description } = req.body;

  if (!user_id || !amount || amount <= 0) {
    throw new AppError('user_id e amount (positivo) são obrigatórios', 400, 'MISSING_FIELDS');
  }

  let coinAccount = await Coin.findOne({
    where: { user_id }
  });

  if (!coinAccount) {
    coinAccount = await Coin.create({
      user_id,
      balance: amount
    });
  } else {
    coinAccount.balance += amount;
    await coinAccount.save();
  }

  await CoinTransaction.create({
    user_id,
    amount,
    type: 'bonus',
    description: description || 'Bônus concedido',
    metadata: { granted_by: req.userId }
  });

  logger.info('Bônus adicionado por admin', {
    adminId: req.userId,
    userId: user_id,
    amount,
    newBalance: coinAccount.balance
  });

  res.json({
    success: true,
    new_balance: coinAccount.balance,
    message: `${amount} moedas adicionadas como bônus`
  });
});

// Estatísticas (admin)
exports.getStats = catchAsync(async (req, res, next) => {
  const [
    totalUsers,
    totalCoinsInCirculation,
    totalPurchases,
    totalSpent,
    topUsers
  ] = await Promise.all([
    Coin.count(),
    Coin.sum('balance'),
    CoinTransaction.count({ where: { type: 'purchase' } }),
    CoinTransaction.sum('amount', { where: { type: 'spend', amount: { [Op.lt]: 0 } } }),
    Coin.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['balance', 'DESC']],
      limit: 10
    })
  ]);

  logger.info('Estatísticas de moedas acessadas', {
    userId: req.user.id,
    totalUsers,
    totalCoinsInCirculation,
    totalPurchases
  });

  res.json({
    total_users: totalUsers,
    total_coins_in_circulation: totalCoinsInCirculation || 0,
    total_purchases: totalPurchases,
    total_spent: Math.abs(totalSpent || 0),
    top_users: topUsers
  });
});