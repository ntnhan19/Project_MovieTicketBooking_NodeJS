//backend/src/App.js
const express = require('express');
const cors = require('cors');

const movieRoutes = require('./routes/movieRoutes');
const genreRoutes = require('./routes/genreRoutes');
const showtimeRoutes = require('./routes/showtimeRoutes');
const hallRoutes = require('./routes/hallRoutes');
const cinemaRoutes = require('./routes/cinemaRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const promotionRoutes = require('./routes/promotionRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const seatRoutes = require('./routes/seatRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3002'], // 3001 là Admin, 3002 là frontend user
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/showtimes', showtimeRoutes); 
app.use('/api/halls', hallRoutes);
app.use('/api/cinemas', cinemaRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('API is working ✅');
});

module.exports = app;