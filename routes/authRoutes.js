const express = require('express');
const router = express.Router();
const prisma = require('../db'); // 引用資料庫
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'my-super-secret-key';

// 1. 註冊 API (App 傳 JSON 來，我們回 JSON)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 存入資料庫
    const newUser = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    
    res.json({ success: true, message: "註冊成功", userId: newUser.id });
  } catch (error) {
    res.status(400).json({ success: false, message: "註冊失敗 (Email可能重複了)" });
  }
});

// 2. 登入 API (最重要！App 拿 Token 的地方)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 找人
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ success: false, message: "找不到此帳號" });

  // 驗密碼
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ success: false, message: "密碼錯誤" });

  // 發 Token
  const token = jwt.sign({ userId: user.id, name: user.name }, SECRET_KEY, { expiresIn: '24h' });

  // 回傳 JSON
  res.json({
    success: true,
    message: "登入成功",
    token: token, // <--- App 會把這個存起來
    user: { id: user.id, name: user.name, email: user.email }
  });
});

module.exports = router;