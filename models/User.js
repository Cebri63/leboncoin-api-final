const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: { type: String, unique: true },
  token: String, // Le token permettra d'authentifier l'utilisateur
  hash: String,
  salt: String,

  // Nous choisisons de créer un objet `account` dans lequel nous stockerons les informations non sensibles
  account: {
    username: { type: String, required: true },
    phone: { type: String }
  }
});

module.exports = User;
