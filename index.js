const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
app.use(cors());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

app.get("/", function(req, res) {
  res.send("Welcome to the leboncoin API.");
});

const userRoutes = require("./routes/user.js");
const offerRoutes = require("./routes/offer.js");
const paymentRoutes = require("./routes/payment");
app.use(userRoutes);
app.use(offerRoutes);
app.use(paymentRoutes);

/*
Toutes les méthodes HTTP (GET, POST, etc.) des pages non trouvées afficheront
une erreur 404
*/

app.all("*", function(req, res) {
  res.status(404).json({ error: "Not Found" });
});

app.listen(process.env.PORT, () => {
  console.log("leboncoin API running");
});
