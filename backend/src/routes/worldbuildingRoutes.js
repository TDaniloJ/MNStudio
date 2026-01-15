const express = require('express');
const router = express.Router();
const worldbuildingController = require('../controllers/worldbuildingController');
const { auth, isUploaderOrAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Debug checks to ensure middlewares/handlers are functions
const debugCheck = (name, val) => {
	try {
		const t = typeof val === 'function' ? 'function' : typeof val;
		console.log(`[worldbuildingRoutes] ${name}: ${t}`);
		if (typeof val !== 'function') {
			throw new TypeError(`${name} is not a function (type=${typeof val})`);
		}
	} catch (err) {
		console.error('[worldbuildingRoutes] Debug check failed for', name, err);
		throw err;
	}
};

debugCheck('auth', auth);
debugCheck('isUploaderOrAdmin', isUploaderOrAdmin);
debugCheck('createCharacter handler', worldbuildingController.createCharacter);
// Check upload.single returns a middleware function
const singleUpload = upload.single ? upload.single('image') : null;
debugCheck('upload.single(image)', singleUpload);
debugCheck('updateWorld handler', worldbuildingController.updateWorld);

// ========== CHARACTERS ==========
router.get('/novels/:novel_id/characters', auth, worldbuildingController.getCharacters);
router.post('/novels/:novel_id/characters', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.createCharacter);
router.put('/characters/:id', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.updateCharacter);
router.delete('/characters/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteCharacter);

// ========== WORLDS ==========
router.get('/novels/:novel_id/worlds', auth, worldbuildingController.getWorlds);
router.post('/novels/:novel_id/worlds', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.createWorld);
router.put('/worlds/:id', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.updateWorld);
router.delete('/worlds/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteWorld);

// ========== MAGIC SYSTEMS ==========
router.get('/novels/:novel_id/magic-systems', auth, worldbuildingController.getMagicSystems);
router.post('/novels/:novel_id/magic-systems', auth, isUploaderOrAdmin, worldbuildingController.createMagicSystem);
router.put('/magic-systems/:id', auth, isUploaderOrAdmin, worldbuildingController.updateMagicSystem);
router.delete('/magic-systems/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteMagicSystem);

// ========== CULTIVATION SYSTEMS ==========
router.get('/novels/:novel_id/cultivation-systems', auth, worldbuildingController.getCultivationSystems);
router.post('/novels/:novel_id/cultivation-systems', auth, isUploaderOrAdmin, worldbuildingController.createCultivationSystem);
router.put('/cultivation-systems/:id', auth, isUploaderOrAdmin, worldbuildingController.updateCultivationSystem);
router.delete('/cultivation-systems/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteCultivationSystem);

// ========== ITEMS ==========
router.get('/novels/:novel_id/items', auth, worldbuildingController.getItems);
router.post('/novels/:novel_id/items', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.createItem);
router.put('/items/:id', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.updateItem);
router.delete('/items/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteItem);

// ========== ORGANIZATIONS ==========
router.get('/novels/:novel_id/organizations', auth, worldbuildingController.getOrganizations);
router.post('/novels/:novel_id/organizations', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.createOrganization);
router.put('/organizations/:id', auth, isUploaderOrAdmin, upload.single('image'), worldbuildingController.updateOrganization);
router.delete('/organizations/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteOrganization);

// ========== TIMELINE ==========
router.get('/novels/:novel_id/timeline', auth, worldbuildingController.getTimelineEvents);
router.post('/novels/:novel_id/timeline', auth, isUploaderOrAdmin, worldbuildingController.createTimelineEvent);
router.put('/timeline/:id', auth, isUploaderOrAdmin, worldbuildingController.updateTimelineEvent);
router.delete('/timeline/:id', auth, isUploaderOrAdmin, worldbuildingController.deleteTimelineEvent);

module.exports = router;