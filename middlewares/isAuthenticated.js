const User = require("../models/User.js");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const user = await User.findOne({
        token: req.headers.authorization.replace("Bearer ", "")
      });

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      } else {
        req.user = user; // créer une clé "user" dans req. La route pourra avoir accès à req.user
        return next();
      }
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = isAuthenticated;
