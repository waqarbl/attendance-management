const jwt = require("jsonwebtoken");
const prisma = require("../../prisma/client");

// Middleware to check token and roles
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access Denied" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid Token" });

    req.user = user;
    next();
  });
};

// Middleware to check if user is part of organization
const isUserInOrganization = async (req, res, next) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });  

  if (!user?.organizationId) {
    return res
      .status(403)
      .json({ message: "User not part of any organization" });
  }

  next();
};

module.exports = { authenticateToken, isUserInOrganization };
