//backend/src/App.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');;
const cors = require('cors');
const movieRoutes = require('./routes/movieRoutes');
const genreRoutes = require('./routes/genreRoutes');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Sử dụng router với prefix /api/movies
app.use('/api/movies', movieRoutes);

// Sử dụng router với prefix /api/genres
app.use('/api/genres', genreRoutes);

app.get('/', (req, res) => {
  res.send('API is working ✅');
});

module.exports = app;