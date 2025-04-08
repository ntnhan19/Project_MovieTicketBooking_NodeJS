// backend/src/routes/genreRoutes.js
const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');

router.get('/', genreController.getAllGenres);  // Get all genres
router.get('/:id', genreController.getGenreById);  // Get genre by ID
router.post('/', genreController.createGenre);  // Create genre
router.put('/:id', genreController.updateGenre);  // Update genre by ID
router.delete('/:id', genreController.deleteGenre);  // Delete genre by ID

module.exports = router;
