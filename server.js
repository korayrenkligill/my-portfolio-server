// server.js

const express = require("express");
var bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8081;

app.use(bodyParser.json());
app.use(cors());

// MongoDB bağlantı URL'i
const mongoURI = process.env.MONGO_URI;

// MongoDB bağlantısı
mongoose
  .connect(mongoURI, {
    dbName: "portfolio_db",
  })
  .then(() => {
    console.log("MongoDB bağlantısı başarılı.");
  })
  .catch((err) => {
    console.error("MongoDB bağlantısı başarısız:", err);
  });

// Kullanıcı modeli ve routes dosyası
const userRoutes = require("./Routes/UserRoutes");

// Kullanıcı rotalarını ekleme
app.use("/api/user", userRoutes);

// Sunucuyu başlatma
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor.`);
});
