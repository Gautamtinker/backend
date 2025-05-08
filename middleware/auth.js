const jwt = require("jsonwebtoken");
const createError = require("http-errors");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError(401, "No token provided");
  }

  try {
    const decoded = jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_SECRET
    );
    req.user = { id: decoded.id };
    console.log(req.user);
    next();
  } catch (err) {
    throw createError(401, "Invalid token");
  }
};
