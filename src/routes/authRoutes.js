const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../../prisma/client");
const handlePrismaError = require("../utils/errorHandler");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and role are required." });
  }

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string" ||
    typeof role !== "string"
  ) {
    return res
      .status(400)
      .json({ message: "Name, email, password, and role must be strings." });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  const userRole = role.toUpperCase() === "ADMIN" ? "ADMIN" : "USER";

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    console.error("Error during operation:", error);
    return res.status(status).json({ message });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required." });
  }

  if (typeof email !== "string" || typeof password !== "string") {
    return res
      .status(400)
      .json({ message: "Email and password must be strings." });
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res
        .status(400)
        .json({
          message:
            "Invalid email or password. Please check your credentials and try again.",
        });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({
          message:
            "Invalid email or password. Please check your credentials and try again.",
        });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );
    const { password: _, updatedAt: __, createdAt: ___, ...rest } = user; 
    res.json({ token, user: rest });
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    console.error("Error during operation:", error);
    return res.status(status).json({ message });
  }
});

module.exports = router;
