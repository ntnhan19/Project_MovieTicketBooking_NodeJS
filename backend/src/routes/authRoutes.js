const express = require("express");
const router = express.Router();
const { authenticate, authorizeRoles } = require("../middlewares/authMiddlewares");

router.get("/admin-only", authenticate, authorizeRoles("ADMIN"), (req, res) => {
  res.json({ message: "Chào admin!" });
});

router.get("/user-only", authenticate, authorizeRoles("USER"), (req, res) => {
  res.json({ message: "Chào người dùng!" });
});

router.post("/register", async (req, res) => {
  const { name, email, password, phone, dob } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        dob: new Date(dob),
        role: "USER", // default role
      },
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
});


module.exports = router;
