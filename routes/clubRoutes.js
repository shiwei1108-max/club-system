const express = require('express');
const router = express.Router(); // 建立一個路由管理員
const prisma = require('../db'); // 引用上一層的資料庫連線

// 1. 顯示控制台首頁 (把 server.js 那大段 HTML 邏輯搬來這裡)
router.get('/club-center', async (req, res) => {
  const clubs = await prisma.club.findMany({
    include: {
      members: { include: { user: true } },
      activities: { include: { expenses: true } }
    }
  });
  const users = await prisma.user.findMany();

  // 這裡省略幾百行 HTML，直接用簡單的回應代表，證明搬家成功
  // (為了教學簡潔，我們先只回傳 JSON，順便讓您體驗 API 的感覺)
  res.json({
    message: "恭喜！這是從獨立路由檔案 (clubRoutes.js) 回傳的資料",
    totalClubs: clubs.length,
    clubs: clubs
  });
});

// 2. 建立社團的 API
router.post('/create-club', async (req, res) => {
  await prisma.club.create({ data: { name: req.body.name } });
  res.redirect('/clubs/club-center'); // 注意：路徑可能會變，等下說明
});

// 3. 加入社團的 API
router.post('/join-club', async (req, res) => {
  try {
    await prisma.clubMember.create({
      data: { userId: parseInt(req.body.userId), clubId: parseInt(req.body.clubId) }
    });
    res.json({ success: true, message: "加入成功" });
  } catch (e) {
    res.status(400).json({ success: false, message: "加入失敗" });
  }
});

// 把這個管理員匯出，讓 server.js 可以用
module.exports = router;