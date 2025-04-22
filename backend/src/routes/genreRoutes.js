// backend/src/routes/genreRoutes.js
const express = require('express');
const router = express.Router();
const genreController = require('../controllers/genreController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes công khai
router.get('/', genreController.getAllGenres);  
router.get('/:id', genreController.getGenreById);

// Routes yêu cầu quyền admin
router.post('/', authenticate, authorizeRoles('ADMIN'), genreController.createGenre);    
router.put('/:id', authenticate, authorizeRoles('ADMIN'), genreController.updateGenre);  
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), genreController.deleteGenre); 

module.exports = router;
