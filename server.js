const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ★ 關鍵：只讀取 React 打包好的 dist 資料夾，不讀 public
app.use(express.static(path.join(__dirname, 'frontend', 'dist')));

const clubRouter = require('./routes/clubRoutes');
const authRouter = require('./routes/authRoutes');
const authenticateToken = require('./middleware/auth');

app.use('/api/auth', authRouter);
app.use('/api/clubs', authenticateToken, clubRouter);

// ★ 關鍵：處理所有網頁請求，回傳 React 的 index.html
app.get(/.*/, (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
  }
});

app.listen(port, () => {
  console.log(`🚀 全端整合系統啟動: http://localhost:${port}`);
});