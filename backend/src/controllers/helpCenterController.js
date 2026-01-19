const { HelpCenter } = require('../models');

module.exports = {
  async getAllHelpEntries(req, res) {
    try {
      const helpEntries = await HelpCenter.findAll({
        order: [['createdAt', 'DESC']]
      });
      res.json({ helpEntries });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar Help Center' });
    }
  },

  async getHelpEntryById(req, res) {
    try {
      const { id } = req.params;
      const helpEntry = await HelpCenter.findByPk(id);

      if (!helpEntry) {
        return res.status(404).json({ error: 'Entrada não encontrada' });
      }

      res.json({ helpEntry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao buscar entrada' });
    }
  },

  async createHelpEntry(req, res) {
    try {
      const { question, answer } = req.body;

      const helpEntry = await HelpCenter.create({
        question,
        answer
      });

      res.status(201).json({ helpEntry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao criar entrada' });
    }
  },

  async updateHelpEntry(req, res) {
    try {
      const { id } = req.params;
      const { question, answer } = req.body;

      const helpEntry = await HelpCenter.findByPk(id);
      if (!helpEntry) {
        return res.status(404).json({ error: 'Entrada não encontrada' });
      }

      await helpEntry.update({ question, answer });
      res.json({ helpEntry });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao atualizar entrada' });
    }
  },

  async deleteHelpEntry(req, res) {
    try {
      const { id } = req.params;

      const helpEntry = await HelpCenter.findByPk(id);
      if (!helpEntry) {
        return res.status(404).json({ error: 'Entrada não encontrada' });
      }

      await helpEntry.destroy();
      res.json({ message: 'Entrada deletada com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erro ao deletar entrada' });
    }
  }
};
