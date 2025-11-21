const express = require('express');
const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 

// 1. 引入路由與警衛
const clubRouter = require('./routes/clubRoutes');
const authRouter = require('./routes/authRoutes');
const authenticateToken = require('./middleware/auth'); // <--- 新警衛報到

// 2. 設定路由
// (A) 登入/註冊：不需要警衛 (不然沒人能註冊了)
app.use('/api/auth', authRouter);

// (B) 社團資料：【需要警衛保護】
// 注意：我在 clubRouter 前面加了 authenticateToken
app.use('/api/clubs', authenticateToken, clubRouter); 


app.get('/', (req, res) => {
  res.json({ status: "OK", message: "API Server Ready (Protected Mode)" });
});

app.listen(port, () => {
  console.log(`🔒 安全伺服器啟動: http://localhost:${port}`);
});