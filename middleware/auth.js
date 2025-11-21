const jwt = require('jsonwebtoken');
const SECRET_KEY = 'my-super-secret-key'; // 必須跟登入時用的鑰匙一樣

// 這是一個「中間人」函式
module.exports = (req, res, next) => {
  // 1. 檢查請求有沒有帶 Token
  // 通常 Token 會放在 Header 的 "Authorization" 欄位
  const authHeader = req.headers['authorization'];
  
  // 格式通常是: "Bearer <token>"，所以我們要切開來拿後面那串
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "⛔ 存取被拒：請先登入 (未提供 Token)" });
  }

  // 2. 驗證 Token 是不是真的
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: "⛔ 存取被拒：Token 無效或已過期" });
    }

    // 3. 驗證通過！把使用者資料掛在 req 上，讓後面的程式知道是誰
    req.user = user;
    next(); // 放行！繼續往下執行
  });
};