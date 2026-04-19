const { SubscriptionPlan, PlanFeature, UserSubscription } = require('../models');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');

/**
 * 📦 Listar planos
 */
exports.getPlans = catchAsync(async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      include: [
        {
          model: PlanFeature,
          as: 'features',
          attributes: ['description', 'type'],
        },
      ],
      order: [['price', 'ASC']],
    });

    const formattedPlans = plans.map(plan => {
    const json = plan.toJSON();

    return {
        ...json,
        price: Number(json.price),

        highlight: json.highlight || false,

        duration_days:
          json.period === 'month'
            ? 30
            : json.period === 'year'
            ? 365
            : null,

        coins_reward: json.coins_reward || 0,

        // separa aqui 👇
        features: json.features
        ?.filter(f => f.type === 'feature')
        .map(f => f.description) || [],

        limitations: json.features
        ?.filter(f => f.type === 'limitation')
        .map(f => f.description) || [],

    };
    });

    res.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({ error: 'Erro ao buscar planos' });
  }
});

/**
 * 👤 Minha assinatura
 */
exports.getMySubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      where: {
        user_id: req.user.id,
        status: 'active',
      },
      include: [
        {
          model: SubscriptionPlan,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({ subscription });
  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ error: 'Erro ao buscar assinatura' });
  }
};

/**
 * 🚀 Assinar plano
 */
exports.subscribe = async (req, res) => {
  const { planId } = req.body;
  const user = await User.findByPk(req.user.id);

  try {
    const plan = await SubscriptionPlan.findByPk(planId);

    if (!plan || !plan.is_active) {
      return res.status(404).json({ error: 'Plano inválido' });
    }

    // ❌ cancelar assinatura antiga
    await UserSubscription.update(
      { status: 'canceled' },
      {
        where: {
          user_id: req.user.id,
          status: 'active',
        },
      }
    );

    // 📅 calcular validade
    let endDate = null;

    if (plan.duration_days) {
      endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.duration_days);
    }
    
    // ✅ criar nova assinatura
    const subscription = await UserSubscription.create({
      user_id: req.user.id,
      plan_id: plan.id,
      status: 'active',
      start_date: new Date(),
      end_date: endDate,
    });

    // 🔥 opcional: atualizar user (compatibilidade com front atual)
    if (user) {
      await user.update({
        subscription_plan: plan.id,
      });
    }
    res.json({
      message: 'Plano assinado com sucesso',
      subscription,
    });
  } catch (error) {
    console.error('Erro ao assinar plano:', error);
    res.status(500).json({ error: 'Erro ao assinar plano' });
  }
};

/**
 * ❌ Cancelar assinatura
 */
exports.cancelSubscription = async (req, res) => {
  try {
    const subscription = await UserSubscription.findOne({
      where: {
        user_id: req.user.id,
        status: 'active',
      },
    });

    if (!subscription) {
      return res.status(404).json({ error: 'Nenhuma assinatura ativa' });
    }

    subscription.status = 'canceled';
    subscription.end_date = new Date();
    await subscription.save();

    await User.update(
      { subscription_plan: 'free' },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Assinatura cancelada' });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ error: 'Erro ao cancelar assinatura' });
  }
};

/**
 * ➕ Criar Planos
 */
exports.createPlan = async (req, res) => {
  try {
    const { name, price, description, duration_days, coins_reward, highlight, features = [], limitations = [] } = req.body;

    const plan = await SubscriptionPlan.create({
      id: name.toLowerCase(), // ou UUID se quiser
      name,
      price,
      description,
      duration_days,
      coins_reward,
      highlight,
    });

    // salvar features
    const allFeatures = [
      ...features.map(f => ({ description: f, type: 'feature' })),
      ...limitations.map(l => ({ description: l, type: 'limitation' })),
    ];

    await PlanFeature.bulkCreate(
      allFeatures.map(f => ({
        ...f,
        plan_id: plan.id,
      }))
    );

    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar plano' });
  }
};

/**
 * ✏️ Atualizar plano
 */
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, duration_days, coins_reward, highlight, features = [], limitations = [] } = req.body;

    const plan = await SubscriptionPlan.findByPk(id);

    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado' });
    }

    await plan.update({ name, price, description, duration_days, coins_reward, highlight, });

    // remover features antigas
    await PlanFeature.destroy({ where: { plan_id: id } });

    // recriar
    const allFeatures = [
      ...features.map(f => ({ description: f, type: 'feature' })),
      ...limitations.map(l => ({ description: l, type: 'limitation' })),
    ];

    await PlanFeature.bulkCreate(
      allFeatures.map(f => ({
        ...f,
        plan_id: id,
      }))
    );

    res.json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar plano' });
  }
};

/**
 * 🗑️ Deletar plano
 */
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    await PlanFeature.destroy({ where: { plan_id: id } });
    await SubscriptionPlan.destroy({ where: { id } });

    res.json({ message: 'Plano deletado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar plano' });
  }
};