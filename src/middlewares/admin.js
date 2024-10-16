

// Middleware to check admin role
const isAdmin = (req, res, next) => {
    
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({ message: "Access restricted to admin only" });
  }
  next();
};

module.exports = { isAdmin };
