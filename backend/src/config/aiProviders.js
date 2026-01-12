module.exports = {
  providers: {
    openai: {
      name: 'GPT (OpenAI)',
      models: ['gpt-4o', 'gpt-4o-mini'],
      defaultModel: 'gpt-4o'
    },
    google: {
      name: 'Gemini (Google)',
      models: ['gemini-1.0-pro', 'gemini-1.0-standard', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-1.5-standard'],
      defaultModel: 'gemini-1.0-pro'
    },
    groq: {
      name: 'Groq',
      models: ['llama-3.1-8b-instant'],
      defaultModel: 'llama-3.1-8b-instant'
    },
    deepseek: {
      name: 'Deepseek',
      models: ['deepseek-chat'],
      defaultModel: 'deepseek-chat'
    },
    anthropic: {
      name: 'Claude (Anthropic)',
      models: ['claude-3-5-sonnet-20241022'],
      defaultModel: 'claude-3-5-sonnet-20241022'
    }
  }
};
