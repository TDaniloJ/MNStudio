const express = require('express');
const router = express.Router();
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const aiService = require('../services/aiService');

function resolveProviderConfig(provider, model) {
  const availableProviders = aiService.getAvailableProviders();

  if (!provider || !availableProviders[provider]) {
    const fallback = Object.keys(availableProviders)[0];

    if (!fallback) {
      throw new Error('Nenhum provedor de IA disponível');
    }

    provider = fallback;
  }

  const providerData = availableProviders[provider];

  if (!providerData.models.includes(model)) {
    model = providerData.defaultModel;
  }

  return { provider, model };
}

// ============================================
// ROTAS PRINCIPAIS
// ============================================

// Listar provedores disponíveis
router.get('/providers', auth, isUploaderOrAdmin, (req, res) => {
  try {
    const providers = aiService.getAvailableProviders();
    res.json({ providers });
  } catch (error) {
    console.error('Erro ao listar provedores:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ROTAS DE CAPÍTULOS
// ============================================

// Gerar capítulo completo (COM CONTEXTO)
router.post('/generate-chapter', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { 
      novelId, 
      chapterNumber, 
      chapterTitle, 
      userPrompt,
      provider,
      model 
    } = req.body;

    if (!novelId) {
      return res.status(400).json({ error: 'novelId é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const content = await aiService.generateNovelChapter(
      novelId,
      { chapterNumber, chapterTitle },
      userPrompt,
      providerConfig
    );

    res.json({ content, provider: providerConfig });
  } catch (error) {
    console.error('Erro ao gerar capítulo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Melhorar conteúdo existente (COM CONTEXTO)
router.post('/improve-content', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { 
      novelId,
      content, 
      improvementPrompt,
      provider,
      model 
    } = req.body;

    if (!novelId) {
      return res.status(400).json({ error: 'novelId é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const improvedContent = await aiService.improveChapterContent(
      novelId,
      content,
      improvementPrompt,
      providerConfig
    );

    res.json({ content: improvedContent, provider: providerConfig });
  } catch (error) {
    console.error('Erro ao melhorar conteúdo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Continuar texto (COM CONTEXTO)
router.post('/continue-text', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { 
      novelId, 
      previousContent, 
      userInstructions,
      provider,
      model 
    } = req.body;

    if (!novelId) {
      return res.status(404).json({ error: 'novelId é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const continuation = await aiService.continueFromText(
      novelId,
      previousContent,
      userInstructions,
      providerConfig
    );

    res.json({ content: continuation, provider: providerConfig });
  } catch (error) {
    console.error('Erro ao continuar texto:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar ideias de capítulos (COM CONTEXTO)
router.get('/chapter-ideas/:novelId', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { novelId } = req.params;
    const { provider, model } = req.query;

    const providerConfig = resolveProviderConfig(provider, model);

    const ideas = await aiService.generateChapterIdeas(novelId, providerConfig);

    res.json({ ideas, provider: providerConfig });
  } catch (error) {
    console.error('Erro ao gerar ideias:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ROTAS DE WORLDBUILDING
// ============================================

// Gerar personagem (COM CONTEXTO)
router.post('/generate-character', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { novel_id, character_type, traits, provider, model } = req.body;

    if (!novel_id) {
      return res.status(400).json({ error: 'novel_id é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const result = await aiService.generateCharacter(
      novel_id,
      character_type,
      traits,
      providerConfig
    );

    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar personagem:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar mundo (COM CONTEXTO)
router.post('/generate-world', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { novel_id, world_type, elements, provider, model } = req.body;

    if (!novel_id) {
      return res.status(400).json({ error: 'novel_id é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const result = await aiService.generateWorld(
      novel_id,
      world_type,
      elements,
      providerConfig
    );

    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar mundo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar sistema de magia (COM CONTEXTO)
router.post('/generate-magic-system', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { novel_id, system_type, rules, provider, model } = req.body;

    if (!novel_id) {
      return res.status(400).json({ error: 'novel_id é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const result = await aiService.generateMagicSystem(
      novel_id,
      system_type,
      rules,
      providerConfig
    );

    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar sistema de magia:', error);
    res.status(500).json({ error: error.message });
  }
});

// Gerar sistema de cultivo (COM CONTEXTO)
router.post('/generate-cultivation', auth, isUploaderOrAdmin, async (req, res) => {
  try {
    const { novel_id, levels, provider, model } = req.body;

    if (!novel_id) {
      return res.status(400).json({ error: 'novel_id é obrigatório' });
    }

    const providerConfig = resolveProviderConfig(provider, model);

    const result = await aiService.generateCultivationSystem(
      novel_id,
      levels,
      providerConfig
    );

    res.json(result);
  } catch (error) {
    console.error('Erro ao gerar sistema de cultivo:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;