//backend/src/App.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');;
const cors = require('cors');

const movieRoutes = require('./routes/movieRoutes');
const genreRoutes = require('./routes/genreRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const authRoutes = require("./routes/authRoutes");
const hallRoutes = require('./routes/hallRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/showtimes', showtimeRoutes); 
app.use('/api/halls', hallRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is working ✅');
});

module.exports = app;