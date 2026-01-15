const {
    Character,
    World,
    MagicSystem,
    CultivationSystem,
    Item,
    Organization,
    Timeline
} = require('../models');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// ========== CHARACTERS ==========
exports.createCharacter = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;

        // Parse JSON fields
        if (data.strengths && typeof data.strengths === 'string') {
            data.strengths = JSON.parse(data.strengths);
        }
        if (data.weaknesses && typeof data.weaknesses === 'string') {
            data.weaknesses = JSON.parse(data.weaknesses);
        }
        if (data.abilities && typeof data.abilities === 'string') {
            data.abilities = JSON.parse(data.abilities);
        }
        if (data.relationships && typeof data.relationships === 'string') {
            data.relationships = JSON.parse(data.relationships);
        }

        // Handle image upload
        if (req.file) {
            const filename = `character-${Date.now()}.webp`;
            const filepath = path.join('uploads/characters', filename);

            await sharp(req.file.path)
                .resize(400, 400, { fit: 'cover' })
                .webp({ quality: 90 })
                .toFile(filepath);

            await fs.unlink(req.file.path);
            data.image_url = `/uploads/characters/${filename}`;
        }

        const character = await Character.create({
            ...data,
            novel_id
        });

        res.status(201).json({
            message: 'Personagem criado com sucesso',
            character
        });
    } catch (error) {
        console.error('Erro ao criar personagem:', error);
        res.status(500).json({ error: 'Erro ao criar personagem' });
    }
};

exports.getCharacters = async (req, res) => {
    try {
        const { novel_id } = req.params;

        const characters = await Character.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ characters });
    } catch (error) {
        console.error('Erro ao buscar personagens:', error);
        res.status(500).json({ error: 'Erro ao buscar personagens' });
    }
};

exports.updateCharacter = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const character = await Character.findByPk(id);
        if (!character) {
            return res.status(404).json({ error: 'Personagem não encontrado' });
        }

        // Parse JSON fields
        if (data.strengths && typeof data.strengths === 'string') {
            data.strengths = JSON.parse(data.strengths);
        }
        if (data.weaknesses && typeof data.weaknesses === 'string') {
            data.weaknesses = JSON.parse(data.weaknesses);
        }
        if (data.abilities && typeof data.abilities === 'string') {
            data.abilities = JSON.parse(data.abilities);
        }
        if (data.relationships && typeof data.relationships === 'string') {
            data.relationships = JSON.parse(data.relationships);
        }

        // Handle image update
        if (req.file) {
            // Delete old image
            if (character.image_url) {
                const oldPath = path.join(__dirname, '../..', character.image_url);
                try {
                    await fs.unlink(oldPath);
                } catch (err) {
                    console.log('Erro ao deletar imagem antiga:', err);
                }
            }

            const filename = `character-${Date.now()}.webp`;
            const filepath = path.join('uploads/characters', filename);

            await sharp(req.file.path)
                .resize(400, 400, { fit: 'cover' })
                .webp({ quality: 90 })
                .toFile(filepath);

            await fs.unlink(req.file.path);
            data.image_url = `/uploads/characters/${filename}`;
        }

        await character.update(data);

        res.json({
            message: 'Personagem atualizado com sucesso',
            character
        });
    } catch (error) {
        console.error('Erro ao atualizar personagem:', error);
        res.status(500).json({ error: 'Erro ao atualizar personagem' });
    }
};

exports.deleteCharacter = async (req, res) => {
    try {
        const { id } = req.params;

        const character = await Character.findByPk(id);
        if (!character) {
            return res.status(404).json({ error: 'Personagem não encontrado' });
        }

        // Delete image
        if (character.image_url) {
            const imagePath = path.join(__dirname, '../..', character.image_url);
            try {
                await fs.unlink(imagePath);
            } catch (err) {
                console.log('Erro ao deletar imagem:', err);
            }
        }

        await character.destroy();

        res.json({ message: 'Personagem deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar personagem:', error);
        res.status(500).json({ error: 'Erro ao deletar personagem' });
    }
};

// ========== WORLDS ==========
exports.createWorld = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;

        // Parse JSON/Array fields
        if (data.races && typeof data.races === 'string') {
            data.races = JSON.parse(data.races);
        }
        if (data.languages && typeof data.languages === 'string') {
            data.languages = JSON.parse(data.languages);
        }
        if (data.locations && typeof data.locations === 'string') {
            data.locations = JSON.parse(data.locations);
        }
        if (data.resources && typeof data.resources === 'string') {
            data.resources = JSON.parse(data.resources);
        }
        if (data.dangers && typeof data.dangers === 'string') {
            data.dangers = JSON.parse(data.dangers);
        }

        // Handle image upload
        if (req.file) {
            const filename = `world-${Date.now()}.webp`;
            const filepath = path.join('uploads/worlds', filename);

            await sharp(req.file.path)
                .resize(800, 600, { fit: 'cover' })
                .webp({ quality: 85 })
                .toFile(filepath);

            await fs.unlink(req.file.path);
            data.image_url = `/uploads/worlds/${filename}`;
        }

        const world = await World.create({
            ...data,
            novel_id
        });

        res.status(201).json({
            message: 'Mundo criado com sucesso',
            world
        });
    } catch (error) {
        console.error('Erro ao criar mundo:', error);
        res.status(500).json({ error: 'Erro ao criar mundo' });
    }
};

exports.getWorlds = async (req, res) => {
    try {
        const { novel_id } = req.params;

        const worlds = await World.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ worlds });
    } catch (error) {
        console.error('Erro ao buscar mundos:', error);
        res.status(500).json({ error: 'Erro ao buscar mundos' });
    }
};

// Continua com update e delete de World, MagicSystem, CultivationSystem, Item, Organization, Timeline...
// (Padrão similar aos anteriores)

// ========== MAGIC SYSTEMS ==========
exports.createMagicSystem = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;

        // Parse JSON fields
        if (data.elements && typeof data.elements === 'string') {
            data.elements = JSON.parse(data.elements);
        }
        if (data.ranks && typeof data.ranks === 'string') {
            data.ranks = JSON.parse(data.ranks);
        }
        if (data.spells && typeof data.spells === 'string') {
            data.spells = JSON.parse(data.spells);
        }

        const system = await MagicSystem.create({
            ...data,
            novel_id
        });

        res.status(201).json({
            message: 'Sistema de magia criado com sucesso',
            system
        });
    } catch (error) {
        console.error('Erro ao criar sistema de magia:', error);
        res.status(500).json({ error: 'Erro ao criar sistema de magia' });
    }
};

exports.getMagicSystems = async (req, res) => {
    try {
        const { novel_id } = req.params;

        const systems = await MagicSystem.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ systems });
    } catch (error) {
        console.error('Erro ao buscar sistemas de magia:', error);
        res.status(500).json({ error: 'Erro ao buscar sistemas de magia' });
    }
};

// ========== CULTIVATION SYSTEMS ==========
exports.createCultivationSystem = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;

        // Parse JSON fields
        if (data.levels && typeof data.levels === 'string') {
            data.levels = JSON.parse(data.levels);
        }
        if (data.resources_needed && typeof data.resources_needed === 'string') {
            data.resources_needed = JSON.parse(data.resources_needed);
        }
        if (data.benefits && typeof data.benefits === 'string') {
            data.benefits = JSON.parse(data.benefits);
        }
        if (data.techniques && typeof data.techniques === 'string') {
            data.techniques = JSON.parse(data.techniques);
        }

        const system = await CultivationSystem.create({
            ...data,
            novel_id
        });

        res.status(201).json({
            message: 'Sistema de cultivo criado com sucesso',
            system
        });
    } catch (error) {
        console.error('Erro ao criar sistema de cultivo:', error);
        res.status(500).json({ error: 'Erro ao criar sistema de cultivo' });
    }
};

exports.getCultivationSystems = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const systems = await CultivationSystem.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ systems });
    } catch (error) {
        console.error('Erro ao buscar sistemas de cultivo:', error);
        res.status(500).json({ error: 'Erro ao buscar sistemas de cultivo' });
    }
};

// ========== UPDATES / DELETES (WORLDS, MAGIC, CULTIVATION) ==========
exports.updateWorld = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const world = await World.findByPk(id);
        if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

        if (req.file) {
            if (world.image_url) {
                const oldPath = path.join(__dirname, '../..', world.image_url);
                try { await fs.unlink(oldPath); } catch (e) { console.warn(e); }
            }
            const filename = `world-${Date.now()}.webp`;
            const filepath = path.join('uploads/worlds', filename);
            await sharp(req.file.path).resize(800,600,{fit:'cover'}).webp({quality:85}).toFile(filepath);
            await fs.unlink(req.file.path);
            data.image_url = `/uploads/worlds/${filename}`;
        }

        await world.update(data);
        res.json({ message: 'Mundo atualizado com sucesso', world });
    } catch (error) {
        console.error('Erro ao atualizar mundo:', error);
        res.status(500).json({ error: 'Erro ao atualizar mundo' });
    }
};

exports.deleteWorld = async (req, res) => {
    try {
        const { id } = req.params;
        const world = await World.findByPk(id);
        if (!world) return res.status(404).json({ error: 'Mundo não encontrado' });

        if (world.image_url) {
            const imagePath = path.join(__dirname, '../..', world.image_url);
            try { await fs.unlink(imagePath); } catch (e) { console.warn(e); }
        }

        await world.destroy();
        res.json({ message: 'Mundo deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar mundo:', error);
        res.status(500).json({ error: 'Erro ao deletar mundo' });
    }
};

exports.updateMagicSystem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const system = await MagicSystem.findByPk(id);
        if (!system) return res.status(404).json({ error: 'Sistema não encontrado' });

        await system.update(data);
        res.json({ message: 'Sistema de magia atualizado', system });
    } catch (error) {
        console.error('Erro ao atualizar sistema de magia:', error);
        res.status(500).json({ error: 'Erro ao atualizar sistema de magia' });
    }
};

exports.deleteMagicSystem = async (req, res) => {
    try {
        const { id } = req.params;
        const system = await MagicSystem.findByPk(id);
        if (!system) return res.status(404).json({ error: 'Sistema não encontrado' });

        await system.destroy();
        res.json({ message: 'Sistema de magia deletado' });
    } catch (error) {
        console.error('Erro ao deletar sistema de magia:', error);
        res.status(500).json({ error: 'Erro ao deletar sistema de magia' });
    }
};

exports.updateCultivationSystem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const system = await CultivationSystem.findByPk(id);
        if (!system) return res.status(404).json({ error: 'Sistema não encontrado' });

        await system.update(data);
        res.json({ message: 'Sistema de cultivo atualizado', system });
    } catch (error) {
        console.error('Erro ao atualizar sistema de cultivo:', error);
        res.status(500).json({ error: 'Erro ao atualizar sistema de cultivo' });
    }
};

exports.deleteCultivationSystem = async (req, res) => {
    try {
        const { id } = req.params;
        const system = await CultivationSystem.findByPk(id);
        if (!system) return res.status(404).json({ error: 'Sistema não encontrado' });

        await system.destroy();
        res.json({ message: 'Sistema de cultivo deletado' });
    } catch (error) {
        console.error('Erro ao deletar sistema de cultivo:', error);
        res.status(500).json({ error: 'Erro ao deletar sistema de cultivo' });
    }
};

// ========== ITEMS ==========
exports.getItems = async (req, res) => {
    try {
        const { novel_id } = req.params;

        const items = await Item.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ items });
    } catch (error) {
        console.error('Erro ao buscar items:', error);
        res.status(500).json({ error: 'Erro ao buscar items' });
    }
};

exports.createItem = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;

        if (req.file) {
            const filename = `item-${Date.now()}.webp`;
            const filepath = path.join('uploads/items', filename);
            await sharp(req.file.path).resize(400,400,{fit:'cover'}).webp({quality:85}).toFile(filepath);
            await fs.unlink(req.file.path);
            data.image_url = `/uploads/items/${filename}`;
        }

        const item = await Item.create({ ...data, novel_id });
        res.status(201).json({ message: 'Item criado', item });
    } catch (error) {
        console.error('Erro ao criar item:', error);
        res.status(500).json({ error: 'Erro ao criar item' });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const item = await Item.findByPk(id);
        if (!item) return res.status(404).json({ error: 'Item não encontrado' });

        if (req.file) {
            if (item.image_url) {
                const oldPath = path.join(__dirname, '../..', item.image_url);
                try { await fs.unlink(oldPath); } catch (e) { console.warn(e); }
            }
            const filename = `item-${Date.now()}.webp`;
            const filepath = path.join('uploads/items', filename);
            await sharp(req.file.path).resize(400,400,{fit:'cover'}).webp({quality:85}).toFile(filepath);
            await fs.unlink(req.file.path);
            data.image_url = `/uploads/items/${filename}`;
        }

        await item.update(data);
        res.json({ message: 'Item atualizado', item });
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        res.status(500).json({ error: 'Erro ao atualizar item' });
    }
};

exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findByPk(id);
        if (!item) return res.status(404).json({ error: 'Item não encontrado' });

        if (item.image_url) {
            const imagePath = path.join(__dirname, '../..', item.image_url);
            try { await fs.unlink(imagePath); } catch (e) { console.warn(e); }
        }

        await item.destroy();
        res.json({ message: 'Item deletado' });
    } catch (error) {
        console.error('Erro ao deletar item:', error);
        res.status(500).json({ error: 'Erro ao deletar item' });
    }
};

// ========== ORGANIZATIONS ==========
exports.getOrganizations = async (req, res) => {
    try {
        const { novel_id } = req.params;

        const organizations = await Organization.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ organizations });
    } catch (error) {
        console.error('Erro ao buscar organizações:', error);
        res.status(500).json({ error: 'Erro ao buscar organizações' });
    }
};

exports.createOrganization = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;

        if (req.file) {
            const filename = `org-${Date.now()}.webp`;
            const filepath = path.join('uploads/organizations', filename);
            await sharp(req.file.path).resize(400,400,{fit:'cover'}).webp({quality:85}).toFile(filepath);
            await fs.unlink(req.file.path);
            data.image_url = `/uploads/organizations/${filename}`;
        }

        const org = await Organization.create({ ...data, novel_id });
        res.status(201).json({ message: 'Organização criada', org });
    } catch (error) {
        console.error('Erro ao criar organização:', error);
        res.status(500).json({ error: 'Erro ao criar organização' });
    }
};

exports.updateOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const org = await Organization.findByPk(id);
        if (!org) return res.status(404).json({ error: 'Organização não encontrada' });

        if (req.file) {
            if (org.image_url) {
                const oldPath = path.join(__dirname, '../..', org.image_url);
                try { await fs.unlink(oldPath); } catch (e) { console.warn(e); }
            }
            const filename = `org-${Date.now()}.webp`;
            const filepath = path.join('uploads/organizations', filename);
            await sharp(req.file.path).resize(400,400,{fit:'cover'}).webp({quality:85}).toFile(filepath);
            await fs.unlink(req.file.path);
            data.image_url = `/uploads/organizations/${filename}`;
        }

        await org.update(data);
        res.json({ message: 'Organização atualizada', org });
    } catch (error) {
        console.error('Erro ao atualizar organização:', error);
        res.status(500).json({ error: 'Erro ao atualizar organização' });
    }
};

exports.deleteOrganization = async (req, res) => {
    try {
        const { id } = req.params;
        const org = await Organization.findByPk(id);
        if (!org) return res.status(404).json({ error: 'Organização não encontrada' });

        if (org.image_url) {
            const imagePath = path.join(__dirname, '../..', org.image_url);
            try { await fs.unlink(imagePath); } catch (e) { console.warn(e); }
        }

        await org.destroy();
        res.json({ message: 'Organização deletada' });
    } catch (error) {
        console.error('Erro ao deletar organização:', error);
        res.status(500).json({ error: 'Erro ao deletar organização' });
    }
};

// ========== TIMELINE ==========
exports.getTimelineEvents = async (req, res) => {
    try {
        const { novel_id } = req.params;

        const events = await Timeline.findAll({
            where: { novel_id },
            order: [['created_at', 'DESC']]
        });

        res.json({ events });
    } catch (error) {
        console.error('Erro ao buscar timeline:', error);
        res.status(500).json({ error: 'Erro ao buscar timeline' });
    }
};

exports.createTimelineEvent = async (req, res) => {
    try {
        const { novel_id } = req.params;
        const data = req.body;
        const event = await Timeline.create({ ...data, novel_id });
        res.status(201).json({ message: 'Evento criado', event });
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        res.status(500).json({ error: 'Erro ao criar evento' });
    }
};

exports.updateTimelineEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const event = await Timeline.findByPk(id);
        if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

        await event.update(data);
        res.json({ message: 'Evento atualizado', event });
    } catch (error) {
        console.error('Erro ao atualizar evento:', error);
        res.status(500).json({ error: 'Erro ao atualizar evento' });
    }
};

exports.deleteTimelineEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await Timeline.findByPk(id);
        if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

        await event.destroy();
        res.json({ message: 'Evento deletado' });
    } catch (error) {
        console.error('Erro ao deletar evento:', error);
        res.status(500).json({ error: 'Erro ao deletar evento' });
    }
};