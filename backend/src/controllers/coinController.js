const { Coin, CoinTransaction, CoinPackage, User } = require('../models');
const { Op } = require('sequelize');

// Obter saldo do usuário
exports.getBalance = async (req, res) => {
  try {
    let coinAccount = await Coin.findOne({
      where: { user_id: req.userId }
    });

    if (!coinAccount) {
      coinAccount = await Coin.create({
        user_id: req.userId,
        balance: 20
      });
    }

    res.json({
      balance: coinAccount.balance
    });
  } catch (error) {
    console.error('Erro ao buscar saldo:', error);
    res.status(500).json({ error: 'Erro ao buscar saldo' });
  }
};

// Obter histórico de transações
exports.getTransactions = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const transactions = await CoinTransaction.findAll({
      where: { user_id: req.userId },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ transactions });
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ error: 'Erro ao buscar transações' });
  }
};

// Listar pacotes disponíveis
exports.getPackages = async (req, res) => {
  try {
    const packages = await CoinPackage.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC'], ['price', 'ASC']]
    });

    res.json({ packages });
  } catch (error) {
    console.error('Erro ao buscar pacotes:', error);
    res.status(500).json({ error: 'Erro ao buscar pacotes' });
  }
};

// Comprar pacote
exports.purchasePackage = async (req, res) => {
  try {
    const { package_id, payment_method } = req.body;

    const pkg = await CoinPackage.findByPk(package_id);
    if (!pkg || !pkg.is_active) {
      return res.status(404).json({ error: 'Pacote não encontrado' });
    }

    // TODO: Integrar com gateway de pagamento real
    // Por enquanto, simula compra bem-sucedida

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

    res.json({
      success: true,
      new_balance: coinAccount.balance,
      coins_added: totalCoins,
      message: `${totalCoins} moedas adicionadas com sucesso!`
    });
  } catch (error) {
    console.error('Erro ao comprar pacote:', error);
    res.status(500).json({ error: 'Erro ao processar compra' });
  }
};

// Gastar moedas
exports.spendCoins = async (req, res) => {
  try {
    const { amount, description, reference_id, metadata } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
    }

    const coinAccount = await Coin.findOne({
      where: { user_id: req.userId }
    });

    if (!coinAccount || coinAccount.balance < amount) {
      return res.status(400).json({ 
        error: 'Saldo insuficiente',
        balance: coinAccount?.balance || 0,
        required: amount
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

    res.json({
      success: true,
      new_balance: coinAccount.balance,
      coins_spent: amount
    });
  } catch (error) {
    console.error('Erro ao gastar moedas:', error);
    res.status(500).json({ error: 'Erro ao processar gasto' });
  }
};

// Adicionar bônus (admin)
exports.addBonus = async (req, res) => {
  try {
    const { user_id, amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valor inválido' });
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

    res.json({
      success: true,
      new_balance: coinAccount.balance,
      message: `${amount} moedas adicionadas como bônus`
    });
  } catch (error) {
    console.error('Erro ao adicionar bônus:', error);
    res.status(500).json({ error: 'Erro ao adicionar bônus' });
  }
};

// Estatísticas (admin)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await Coin.count();
    const totalCoinsInCirculation = await Coin.sum('balance');
    
    const totalPurchases = await CoinTransaction.count({
      where: { type: 'purchase' }
    });

    const totalSpent = await CoinTransaction.sum('amount', {
      where: { type: 'spend', amount: { [Op.lt]: 0 } }
    });

    const topUsers = await Coin.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email']
      }],
      order: [['balance', 'DESC']],
      limit: 10
    });

    res.json({
      total_users: totalUsers,
      total_coins_in_circulation: totalCoinsInCirculation || 0,
      total_purchases: totalPurchases,
      total_spent: Math.abs(totalSpent || 0),
      top_users: topUsers
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas' });
  }
};