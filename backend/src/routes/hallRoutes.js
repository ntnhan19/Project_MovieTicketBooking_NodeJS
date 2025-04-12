//backend/src/routes/hallRoutes.js
const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');

router.get('/', hallController.getAllHalls);  // Get all halls
router.get('/:id', hallController.getHallById);  // Get hall by ID
router.post('/', hallController.createHall);  // Create hall
router.put('/:id', hallController.updateHall);  // Update hall by ID
router.delete('/:id', hallController.deleteHall);  // Delete hall by ID

module.exports = router;