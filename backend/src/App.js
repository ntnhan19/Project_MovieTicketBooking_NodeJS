const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const seatService = require("./services/seatService");
const movieRoutes = require("./routes/movieRoutes");
const genreRoutes = require("./routes/genreRoutes");
const showtimeRoutes = require("./routes/showtimeRoutes");
const hallRoutes = require("./routes/hallRoutes");
const cinemaRoutes = require("./routes/cinemaRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const promotionRoutes = require("./routes/promotionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const seatRoutes = require("./routes/seatRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const concessionCategoryRoutes = require("./routes/concessionCategoryRoutes");
const concessionItemRoutes = require("./routes/concessionItemRoutes");
const concessionComboRoutes = require("./routes/concessionComboRoutes");
const concessionOrderRoutes = require("./routes/concessionOrderRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3002"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:3002"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// Xử lý kết nối WebSocket
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("joinShowtime", (showtimeId) => {
    socket.join(`showtime:${showtimeId}`);
    console.log(`Client ${socket.id} joined showtime:${showtimeId}`);
  });

  socket.on("seatUpdate", (data) => {
    const { showtimeId, seatId, status, triggeredBy } = data;
    socket.to(`showtime:${showtimeId}`).emit("seatUpdate", data);
    console.log(
      `Broadcasted seat update: showtime:${showtimeId}, seatId:${seatId}, status:${status}, triggeredBy:${triggeredBy}`
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Gắn io vào app để sử dụng trong controller
app.set("io", io);

// Chạy cleanupExpiredLocks định kỳ mỗi phút
setInterval(() => {
  seatService.cleanupExpiredLocks(io);
}, 60 * 1000);

// Routes
app.use("/api/movies", movieRoutes);
app.use("/api/genres", genreRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/halls", hallRoutes);
app.use("/api/cinemas", cinemaRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/concession/categories", concessionCategoryRoutes);
app.use("/api/concession/items", concessionItemRoutes);
app.use("/api/concession/combos", concessionComboRoutes);
app.use("/api/concession/orders", concessionOrderRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API is working ✅");
});

module.exports = { app, server };