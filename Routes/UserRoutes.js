// routes/userRoutes.js

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

const router = express.Router();

// Tüm kullanıcıları getirme
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, name, surname } = req.body;

    // Şifreyi bcrypt ile hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      name,
      surname,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Kullanıcı girişi endpoint'i
router.post("/login", async (req, res) => {
  const { usernameOrEmail, password, rememberMe } = req.body;
  try {
    // Kullanıcıyı kullanıcı adı veya e-posta adresine göre bul
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    // Kullanıcı bulunamadıysa hata dön
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Şifreyi karşılaştır
    const passwordMatch = await bcrypt.compare(password, user.password);

    // Şifre eşleşmiyorsa hata dön
    if (!passwordMatch) {
      return res.status(401).json({ message: "Geçersiz şifre" });
    }

    // Erişim belirteci oluştur (Access Token)
    const accessToken = jwt.sign(
      { userId: user._id },
      "your_access_token_secret",
      { expiresIn: rememberMe ? "1d" : "1h" } // 1 gün geçerli olacak
    );

    // Yenileme belirteci oluştur (Refresh Token)
    const refreshToken = jwt.sign(
      { userId: user._id },
      "your_refresh_token_secret"
    );

    // Erişim belirteci ve kullanıcı bilgilerini dön
    res.status(200).json({
      accessToken,
      refreshToken,
      expiresIn: rememberMe ? 86400 : 3600,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

module.exports = router;
