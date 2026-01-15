import api from './api';

function parseAIResponse(response) {
  const data = response.data;

  // Nenhum provedor disponível
  if (data?.error) {
    return {
      content: null,
      simulated: true,
      error: data.error,
      provider: null
    };
  }

  // Sucesso normal
  return {
    content: data?.content,
    provider: data?.provider,
    simulated: !!data?.simulated,
    coinsUsed: data?.coinsUsed || 0
  };
}

export const aiService = {

  // ✅ Gerar capítulo completo (COM CONTEXTO AUTOMÁTICO)
  async generateChapter(novelId, chapterNumber, title, userPrompt, config = {}) {
    const body = {
      novelId, // ✅ Backend usa isso para buscar personagens, mundos, capítulos anteriores, etc
      chapterNumber,
      chapterTitle: title,
      userPrompt,
      ...config
    };

    const response = await api.post('/ai/generate-chapter', body);
    return parseAIResponse(response);
  },

  // ✅ Melhorar texto existente (AGORA COM CONTEXTO)
  async improveContent(novelId, content, userPrompt, config = {}) {
    const body = {
      novelId, // ✅ ATUALIZADO: agora precisa do novelId para contexto
      content,
      improvementPrompt: userPrompt,
      ...config
    };

    const response = await api.post('/ai/improve-content', body);
    return parseAIResponse(response);
  },

  // ✅ Continuar história (COM CONTEXTO)
  async continueText(novelId, currentContent, userPrompt, config = {}) {
    const body = {
      novelId, // ✅ Backend usa para manter consistência
      previousContent: currentContent,
      userInstructions: userPrompt,
      ...config
    };

    const response = await api.post('/ai/continue-text', body);
    return parseAIResponse(response);
  },

  // ✅ Gerar ideias (COM CONTEXTO COMPLETO)
  async getChapterIdeas(novelId, config = {}) {
    const params = {};
    if (config.provider) params.provider = config.provider;
    if (config.model) params.model = config.model;

    const response = await api.get(`/ai/chapter-ideas/${novelId}`, { params });
    
    if (response.data?.error) {
      return {
        ideas: [],
        simulated: true,
        error: response.data.error
      };
    }

    return {
      ideas: response.data?.ideas || [],
      provider: response.data?.provider
    };
  },

  // ✅ Gerar personagem (COM CONTEXTO DA NOVEL)
  async generateCharacter(novelId, characterType, traits, config = {}) {
    const response = await api.post('/ai/generate-character', {
      novel_id: novelId, // ✅ IA conhece a novel para criar personagem consistente
      character_type: characterType,
      traits,
      ...config
    });
    return response.data;
  },

  // ✅ Gerar descrição de mundo (COM CONTEXTO)
  async generateWorld(novelId, worldType, elements, config = {}) {
    const response = await api.post('/ai/generate-world', {
      novel_id: novelId, // ✅ IA cria mundo que se encaixa na novel
      world_type: worldType,
      elements,
      ...config
    });
    return response.data;
  },

  // ✅ Gerar sistema de magia (COM CONTEXTO)
  async generateMagicSystem(novelId, systemType, rules, config = {}) {
    const response = await api.post('/ai/generate-magic-system', {
      novel_id: novelId, // ✅ IA cria sistema consistente com a novel
      system_type: systemType,
      rules,
      ...config
    });
    return response.data;
  },

  // ✅ Gerar sistema de cultivo (COM CONTEXTO)
  async generateCultivationSystem(novelId, levels, config = {}) {
    const response = await api.post('/ai/generate-cultivation', {
      novel_id: novelId, // ✅ IA cria sistema alinhado com a novel
      levels,
      ...config
    });
    return response.data;
  },

  // Resumir configurações (opcional, não implementado no backend ainda)
  async summarizeSettings(novelId, config = {}) {
    const response = await api.post('/ai/summarize-settings', {
      novel_id: novelId,
      ...config
    });
    return response.data;
  }
};