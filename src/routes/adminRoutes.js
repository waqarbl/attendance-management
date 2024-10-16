const express = require("express");
const { authenticateToken } = require("../middlewares/auth");
const { isAdmin } = require("../middlewares/admin");
const prisma = require("../../prisma/client");
const router = express.Router();
const handlePrismaError = require("../utils/errorHandler");

// Assign Organization to User
router.post(
  "/assign-organization",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { userId, organizationId } = req.body;

    // Input validation
    if (!userId || !organizationId) {
      return res
        .status(400)
        .json({ message: "userId and organizationId are required." });
    }

    if (typeof userId !== "number" || typeof organizationId !== "number") {
      return res
        .status(400)
        .json({ message: "userId and organizationId must be numbers." });
    }

    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { organizationId },
      });
      res
        .status(200)
        .json({ message: "Organization assigned successfully", user });
    } catch (error) {
      const { status, message } = handlePrismaError(error);
      console.error("Error during operation:", error);
      return res.status(status).json({ message });
    }
  }
);

// Create Organization (Admin Only)
router.post("/organization", authenticateToken, isAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Organization name is required." });
  }

  if (typeof name !== "string" || name.trim() === "") {
    return res
      .status(400)
      .json({ message: "Organization name must be a non-empty string." });
  }

  try {
    const organization = await prisma.organization.create({
      data: { name },
    });
    res.status(201).json({
      message: "Organization created successfully",
      organization,
    });
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    console.error("Error during operation:", error);
    return res.status(status).json({ message });
  }
});

// Read Organizations (Admin Only)
router.get("/organization", authenticateToken, isAdmin, async (req, res) => {
  try {
    const organizations = await prisma.organization.findMany();
    res.status(200).json({ organizations });
  } catch (error) {
    const { status, message } = handlePrismaError(error);
    console.error("Error during operation:", error);
    return res.status(status).json({ message });
  }
});

// Update Organization (Admin Only)
router.put(
  "/organization/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Organization ID is required." });
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      return res.status(400).json({ message: "Invalid organization ID." });
    }

    if (!name) {
      return res
        .status(400)
        .json({ message: "Organization name is required." });
    }

    if (typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ message: "Organization name must be a non-empty string." });
    }

    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({
        message: "Organization name must be between 3 and 100 characters.",
      });
    }

    try {
      const organization = await prisma.organization.update({
        where: { id: parseInt(id) },
        data: { name },
      });
      res.status(200).json({
        message: "Organization updated successfully",
        organization,
      });
    } catch (error) {
      const { status, message } = handlePrismaError(error);
      console.error("Error during operation:", error);
      return res.status(status).json({ message });
    }
  }
);

// Delete Organization (Admin Only)
router.delete(
  "/organization/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    try {
      await prisma.organization.delete({
        where: { id: parseInt(id) },
      });
      res.status(200).json({ message: "Organization deleted successfully" });
    } catch (error) {
      const { status, message } = handlePrismaError(error);
      console.error("Error during operation:", error);
      return res.status(status).json({ message });
    }
  }
);

module.exports = router;
