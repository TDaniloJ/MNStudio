const Anthropic = require('@anthropic-ai/sdk');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const aiProviders = require('../config/aiProviders');
const { Novel, NovelChapter, Genre, Character, World, MagicSystem, CultivationSystem } = require('../models');

const MAX_TOKENS = {
  openai: 4000,
  anthropic: 3000,
  google: 2048,
  groq: 4096,
  deepseek: 4096
};

const FALLBACK_ORDER = ['groq', 'deepseek', 'google', 'openai', 'anthropic'];

class AIService {
  constructor() {
    this.clients = {
      anthropic: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      openai: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      google: new GoogleGenerativeAI(process.env.GOOGLE_API_KEY),
      groq: new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      }),
      deepseek: new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com/'
      })
    };

    this.disabledProviders = new Set();
  }

  hasApiKey(provider) {
    const keyMap = {
      anthropic: process.env.ANTHROPIC_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      google: process.env.GOOGLE_API_KEY,
      groq: process.env.GROQ_API_KEY,
      deepseek: process.env.DEEPSEEK_API_KEY
    };

    const key = keyMap[provider];
    return !!key && typeof key === 'string' && key.trim().length > 10;
  }

  validateModel(provider, model) {
    const providerConfig = aiProviders.providers[provider];

    if (!providerConfig) {
      throw new Error(`Provedor inválido: ${provider}`);
    }

    if (!providerConfig.models.includes(model)) {
      console.warn(`Modelo inválido (${model}) para ${provider}, usando default`);
      return providerConfig.defaultModel;
    }

    return model;
  }

  disableProvider(provider, reason) {
    console.warn(`⚠️ Provider desativado: ${provider} → ${reason}`);
    this.disabledProviders.add(provider);
  }

  getMaxTokens(provider, requested) {
    return Math.min(requested, MAX_TOKENS[provider] || 2048);
  }

  getAvailableProviders() {
    const available = {};

    for (const [key, config] of Object.entries(aiProviders.providers)) {
      if (this.hasApiKey(key) && !this.disabledProviders.has(key)) {
        available[key] = {
          name: config.name,
          models: config.models,
          defaultModel: config.defaultModel,
          maxTokens: MAX_TOKENS[key] || 2048
        };
      }
    }

    return available;
  }

  async generateContent(provider, model, systemPrompt, userMessage, maxTokens = 3000) {
    if (this.disabledProviders.has(provider)) {
      throw new Error(`Provedor ${provider} está desativado`);
    }

    if (!this.hasApiKey(provider)) {
      throw new Error(`API key ausente para ${provider}`);
    }

    model = this.validateModel(provider, model);

    try {
      const tokens = this.getMaxTokens(provider, maxTokens);

      switch (provider) {
        case 'openai':
          return await this.generateWithOpenAI(model, systemPrompt, userMessage, tokens);
        case 'anthropic':
          return await this.generateWithAnthropic(model, systemPrompt, userMessage, tokens);
        case 'google':
          return await this.generateWithGoogle(model, systemPrompt, userMessage, tokens);
        case 'groq':
          return await this.generateWithGroq(model, systemPrompt, userMessage, tokens);
        case 'deepseek':
          return await this.generateWithDeepseek(model, systemPrompt, userMessage, tokens);
        default:
          throw new Error(`Provedor não suportado: ${provider}`);
      }
    } catch (error) {
      const status = error.status || error.statusCode;

      if ([400, 402, 403, 404, 429].includes(status)) {
        this.disableProvider(provider, `erro ${status}`);
      }

      throw error;
    }
  }

  async generateWithFallback(systemPrompt, userMessage, maxTokens) {
    for (const provider of FALLBACK_ORDER) {
      if (this.disabledProviders.has(provider)) continue;
      const model = aiProviders.providers[provider]?.defaultModel;
      if (!model) continue;

      try {
        return await this.generateContent(provider, model, systemPrompt, userMessage, maxTokens);
      } catch (err) {
        console.warn(`Fallback falhou em ${provider}:`, err.message);
      }
    }

    throw new Error('Nenhum provedor de IA disponível no momento');
  }

  async generateWithOpenAI(model, systemPrompt, userMessage, maxTokens) {
    const res = await this.clients.openai.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    return res.choices[0].message.content;
  }

  async generateWithGroq(model, systemPrompt, userMessage, maxTokens) {
    const res = await this.clients.groq.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    return res.choices[0].message.content;
  }

  async generateWithDeepseek(model, systemPrompt, userMessage, maxTokens) {
    const res = await this.clients.deepseek.chat.completions.create({
      model,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ]
    });

    return res.choices[0].message.content;
  }

  async generateWithAnthropic(model, systemPrompt, userMessage, maxTokens) {
    const res = await this.clients.anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    });

    return res.content[0].text;
  }

  async generateWithGoogle(model, systemPrompt, userMessage, maxTokens) {
    const genModel = this.clients.google.getGenerativeModel({
      model,
      generationConfig: { maxOutputTokens: maxTokens }
    });

    const result = await genModel.generateContent(`${systemPrompt}\n\n${userMessage}`);
    return result.response.text();
  }

  // ✅ BUSCAR CONTEXTO COMPLETO DA NOVEL
  async getNovelContext(novelId) {
    const novel = await Novel.findByPk(novelId, {
      include: [
        { model: Genre, as: 'genres' },
        { 
          model: NovelChapter, 
          as: 'chapters',
          limit: 2,
          order: [['chapter_number', 'DESC']],
          attributes: ['chapter_number', 'title', 'content', 'created_at']
        }
      ]
    });

    if (!novel) {
      throw new Error('Novel não encontrada');
    }

    // Buscar worldbuilding (SEM especificar attributes - pega todas as colunas que existem)
    const [characters, worlds, magicSystems, cultivationSystems] = await Promise.all([
      Character.findAll({ 
        where: { novel_id: novelId },
        limit: 20
      }).catch(() => []), // Se falhar, retorna array vazio
      World.findAll({ 
        where: { novel_id: novelId },
        limit: 10
      }).catch(() => []),
      MagicSystem.findAll({ 
        where: { novel_id: novelId },
        limit: 5
      }).catch(() => []),
      CultivationSystem.findAll({ 
        where: { novel_id: novelId },
        limit: 5
      }).catch(() => [])
    ]);

    return {
      novel,
      characters,
      worlds,
      magicSystems,
      cultivationSystems
    };
  }

  // ✅ FORMATAR CONTEXTO PARA A IA
  formatNovelContext(context) {
    const { novel, characters, worlds, magicSystems, cultivationSystems } = context;

    let contextText = `# INFORMAÇÕES DA NOVEL

## Novel: ${novel.title}
**Sinopse**: ${novel.description || 'Não definida'}
**Gêneros**: ${novel.genres?.map(g => g.name).join(', ') || 'Não definido'}
**Tags**: ${novel.tags?.join(', ') || 'Não definido'}

`;

    // Personagens (adaptado para buscar campos que possam existir)
    if (characters.length > 0) {
      contextText += `## PERSONAGENS (${characters.length})\n\n`;
      characters.forEach(char => {
        const name = char.name || char.character_name || 'Personagem';
        const role = char.role || char.character_role || '';
        const desc = char.description || char.bio || char.background || '';
        const traits = char.traits || char.characteristics || '';
        
        contextText += `### ${name}${role ? ` (${role})` : ''}\n`;
        if (desc) contextText += `${desc}\n`;
        if (traits) contextText += `**Características**: ${traits}\n`;
        contextText += '\n';
      });
    }

    // Mundos (adaptado)
    if (worlds.length > 0) {
      contextText += `## MUNDOS/CENÁRIOS (${worlds.length})\n\n`;
      worlds.forEach(world => {
        const name = world.name || world.world_name || 'Local';
        const type = world.type || world.world_type || '';
        const desc = world.description || world.details || '';
        
        contextText += `### ${name}${type ? ` (${type})` : ''}\n`;
        if (desc) contextText += `${desc}\n\n`;
      });
    }

    // Sistemas de Magia (adaptado)
    if (magicSystems.length > 0) {
      contextText += `## SISTEMAS DE MAGIA (${magicSystems.length})\n\n`;
      magicSystems.forEach(system => {
        const name = system.name || system.system_name || 'Sistema';
        const desc = system.description || system.details || '';
        const rules = system.rules || system.magic_rules || '';
        
        contextText += `### ${name}\n`;
        if (desc) contextText += `${desc}\n`;
        if (rules) contextText += `**Regras**: ${rules}\n`;
        contextText += '\n';
      });
    }

    // Sistemas de Cultivo (adaptado)
    if (cultivationSystems.length > 0) {
      contextText += `## SISTEMAS DE CULTIVO (${cultivationSystems.length})\n\n`;
      cultivationSystems.forEach(system => {
        const name = system.name || system.system_name || 'Sistema';
        const desc = system.description || system.details || '';
        const levels = system.levels || system.cultivation_levels || [];
        
        contextText += `### ${name}\n`;
        if (desc) contextText += `${desc}\n`;
        if (levels && levels.length > 0) {
          contextText += `**Níveis**: ${levels.join(' → ')}\n`;
        }
        contextText += '\n';
      });
    }

    // Capítulos anteriores
    if (novel.chapters && novel.chapters.length > 0) {
      contextText += `## ÚLTIMOS CAPÍTULOS\n\n`;
      novel.chapters.forEach(chapter => {
        contextText += `### Capítulo ${chapter.chapter_number}${chapter.title ? ` - ${chapter.title}` : ''}\n`;
        // Pega últimas 500 palavras do capítulo
        const contentPreview = chapter.content 
          ? chapter.content.replace(/<[^>]*>/g, '').slice(-800)
          : 'Sem conteúdo';
        contextText += `${contentPreview}\n\n`;
      });
    }

    return contextText;
  }

  // ✅ GERAR CAPÍTULO COM CONTEXTO COMPLETO
  async generateNovelChapter(novelId, chapterInfo, userPrompt, providerConfig = {}) {
    // Buscar todo o contexto da novel
    const context = await this.getNovelContext(novelId);
    const contextText = this.formatNovelContext(context);

    const systemPrompt = `Você é um escritor profissional de web novels em português do Brasil.

IMPORTANTE:
- Use TODAS as informações de contexto fornecidas (personagens, mundo, magia, cultivo)
- Mantenha consistência com capítulos anteriores
- Respeite a personalidade e características dos personagens estabelecidos
- Use o sistema de magia/cultivo corretamente
- Mantenha o tom e estilo da novel
- Escreva entre 1500-3000 palavras
- Narrativa envolvente e imersiva
- SEM comentários fora da história`;

    const userMessage = `${contextText}

---

## TAREFA: ESCREVER CAPÍTULO

**Capítulo**: ${chapterInfo.chapterNumber}
**Título**: ${chapterInfo.chapterTitle || 'A definir'}

**Instruções do autor**:
${userPrompt || 'Continue a história naturalmente, mantendo consistência com o estabelecido'}

---

Escreva o capítulo agora, usando TODAS as informações de contexto acima.`;

    if (providerConfig.provider && providerConfig.model) {
      return this.generateContent(
        providerConfig.provider,
        providerConfig.model,
        systemPrompt,
        userMessage,
        4000
      );
    }

    return this.generateWithFallback(systemPrompt, userMessage, 4000);
  }

  // ✅ MELHORAR CONTEÚDO COM CONTEXTO
  async improveChapterContent(novelId, content, improvementPrompt, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    const contextText = this.formatNovelContext(context);

    const systemPrompt = `Você é um editor profissional de web novels. Melhore o texto mantendo:
- Consistência com personagens e mundo estabelecidos
- O estilo e tom da novel
- Qualidade narrativa e gramática`;

    const userMessage = `${contextText}

---

## TEXTO PARA MELHORAR:

${content}

---

## INSTRUÇÕES:

${improvementPrompt || 'Melhore a qualidade narrativa, gramática e fluidez mantendo consistência com o contexto'}

Retorne apenas o texto melhorado, sem comentários.`;

    if (providerConfig.provider && providerConfig.model) {
      return this.generateContent(
        providerConfig.provider,
        providerConfig.model,
        systemPrompt,
        userMessage,
        4000
      );
    }

    return this.generateWithFallback(systemPrompt, userMessage, 4000);
  }

  // ✅ CONTINUAR TEXTO COM CONTEXTO
  async continueFromText(novelId, previousContent, userInstructions, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    const contextText = this.formatNovelContext(context);

    const systemPrompt = `Você é um escritor profissional de web novels. Continue a história de forma natural mantendo consistência total.`;

    const userMessage = `${contextText}

---

## TEXTO ANTERIOR (para continuar):

${previousContent.slice(-2000)}

---

## INSTRUÇÕES:

${userInstructions || 'Continue a história naturalmente'}

Continue a partir daqui com 500-1000 palavras. Mantenha o estilo e todos os elementos do contexto.`;

    if (providerConfig.provider && providerConfig.model) {
      return this.generateContent(
        providerConfig.provider,
        providerConfig.model,
        systemPrompt,
        userMessage,
        3000
      );
    }

    return this.generateWithFallback(systemPrompt, userMessage, 3000);
  }

  // ✅ GERAR IDEIAS COM CONTEXTO
  async generateChapterIdeas(novelId, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    const contextText = this.formatNovelContext(context);

    const systemPrompt = `Você é um consultor criativo de web novels. Gere ideias interessantes baseadas no contexto estabelecido.`;

    const userMessage = `${contextText}

---

Com base em TUDO que você leu acima (personagens, mundo, magia, cultivo, capítulos anteriores), gere 5 ideias criativas para os próximos capítulos.

Para cada ideia, forneça:
1. **Título sugerido**
2. **Resumo da trama** (2-3 linhas)
3. **Personagens envolvidos**
4. **Elemento de tensão/gancho**

IMPORTANTE: Use os personagens, locais e sistemas já estabelecidos. Mantenha consistência total.

Formato: Liste numeradas de 1 a 5.`;

    let content;
    if (providerConfig.provider && providerConfig.model) {
      content = await this.generateContent(
        providerConfig.provider,
        providerConfig.model,
        systemPrompt,
        userMessage,
        2000
      );
    } else {
      content = await this.generateWithFallback(systemPrompt, userMessage, 2000);
    }

    // Parse ideas into array
    const ideas = content
      .split(/\n(?=\d+\.)/)
      .filter(line => line.trim())
      .map(line => line.trim());

    return ideas.length > 0 ? ideas : [content];
  }

  // ✅ GERAR PERSONAGEM COM CONTEXTO
  async generateCharacter(novelId, characterType, traits, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    const contextText = this.formatNovelContext(context);

    const systemPrompt = `Você é um criador de personagens para web novels. Crie personagens que se encaixem perfeitamente no universo estabelecido.`;

    const userMessage = `${contextText}

---

## CRIAR PERSONAGEM

**Tipo**: ${characterType || 'Personagem secundário'}
**Características desejadas**: ${traits || 'Não especificado'}

Crie um personagem que se encaixe perfeitamente neste universo. Retorne APENAS um JSON no formato:

{
  "name": "Nome do personagem",
  "description": "Descrição detalhada (3-5 linhas)",
  "traits": "Característica 1\\nCaracterística 2\\nCaracterística 3"
}`;

    let content;
    if (providerConfig.provider && providerConfig.model) {
      content = await this.generateContent(
        providerConfig.provider,
        providerConfig.model,
        systemPrompt,
        userMessage,
        1000
      );
    } else {
      content = await this.generateWithFallback(systemPrompt, userMessage, 1000);
    }

    // Parse JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return { character: JSON.parse(jsonMatch[0]) };
      }
    } catch (e) {
      console.warn('Falha ao parsear JSON de personagem, usando texto bruto');
    }

    return {
      character: {
        name: 'Personagem Gerado',
        description: content,
        traits: traits || ''
      }
    };
  }

  // ✅ GERAR MUNDO COM CONTEXTO
  async generateWorld(novelId, worldType, elements, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    const contextText = this.formatNovelContext(context);

    const systemPrompt = `Você é um criador de mundos para web novels. Crie locais que se encaixem no universo estabelecido.`;

    const userMessage = `${contextText}

---

## CRIAR MUNDO/CENÁRIO

**Tipo**: ${worldType || 'Região/Cidade'}
**Elementos**: ${elements || 'Não especificado'}

Crie um local que se encaixe perfeitamente neste universo. Retorne APENAS um JSON:

{
  "name": "Nome do local",
  "description": "Descrição detalhada (3-5 linhas)"
}`;

    let content;
    if (providerConfig.provider && providerConfig.model) {
      content = await this.generateContent(
        providerConfig.provider,
        providerConfig.model,
        systemPrompt,
        userMessage,
        1000
      );
    } else {
      content = await this.generateWithFallback(systemPrompt, userMessage, 1000);
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return { world: JSON.parse(jsonMatch[0]) };
      }
    } catch (e) {
      console.warn('Falha ao parsear JSON de mundo');
    }

    return {
      world: {
        name: 'Mundo Gerado',
        description: content
      }
    };
  }

  // Métodos de magia e cultivo (similares, ajuste conforme necessário)
  async generateMagicSystem(novelId, systemType, rules, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    
    const systemPrompt = `Você é um criador de sistemas de magia. Crie algo consistente com o universo.`;
    const userMessage = `Baseado na novel, crie um sistema de magia tipo: ${systemType}. Regras: ${rules}. Retorne JSON com name, description, rules.`;

    let content;
    if (providerConfig.provider && providerConfig.model) {
      content = await this.generateContent(providerConfig.provider, providerConfig.model, systemPrompt, userMessage, 1000);
    } else {
      content = await this.generateWithFallback(systemPrompt, userMessage, 1000);
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return { system: JSON.parse(jsonMatch[0]) };
    } catch (e) {}

    return { system: { name: 'Sistema de Magia', description: content, rules: rules || '' } };
  }

  async generateCultivationSystem(novelId, levelCount, providerConfig = {}) {
    const context = await this.getNovelContext(novelId);
    
    const systemPrompt = `Você é um criador de sistemas de cultivo. Crie algo consistente.`;
    const userMessage = `Crie um sistema de cultivo com ${levelCount || 10} níveis. Retorne JSON com name, description, levels (array).`;

    let content;
    if (providerConfig.provider && providerConfig.model) {
      content = await this.generateContent(providerConfig.provider, providerConfig.model, systemPrompt, userMessage, 1000);
    } else {
      content = await this.generateWithFallback(systemPrompt, userMessage, 1000);
    }

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) return { system: JSON.parse(jsonMatch[0]) };
    } catch (e) {}

    return {
      system: {
        name: 'Sistema de Cultivo',
        description: content,
        levels: Array(levelCount || 10).fill('').map((_, i) => `Nível ${i + 1}`)
      }
    };
  }
}

module.exports = new AIService();
module.exports.AIService = AIService;