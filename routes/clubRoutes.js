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

// 2. 建立社團的 API (修正版)
router.post('/create-club', async (req, res) => {
  try {
    const newClub = await prisma.club.create({ data: { name: req.body.name } });
    // 成功回傳 JSON，包含新社團的資料
    res.json({ success: true, message: "社團建立成功", club: newClub });
  } catch (error) {
    res.status(500).json({ success: false, message: "建立失敗" });
  }
});
// 3. 加入社團的 API (修正版)
router.post('/join-club', async (req, res) => {
  try {
    const { userId, clubId } = req.body;
    
    // 檢查是否已經加入過 (避免重複)
    const existing = await prisma.clubMember.findFirst({
      where: { userId: parseInt(userId), clubId: parseInt(clubId) }
    });

    if (existing) {
      return res.json({ success: false, message: "您已經是成員了！" });
    }

    // 建立關聯
    await prisma.clubMember.create({
      data: { userId: parseInt(userId), clubId: parseInt(clubId) }
    });

    res.json({ success: true, message: "加入成功！" });
  } catch (e) {
    res.status(500).json({ success: false, message: "加入失敗" });
  }
});
// 4. 發布活動的 API (修正版)
router.post('/create-activity', async (req, res) => {
  try {
    const { clubId, title, date, content } = req.body;
    const activity = await prisma.activity.create({
      data: {
        title,
        date,
        content,
        clubId: parseInt(clubId)
      }
    });
    res.json({ success: true, message: "活動發布成功", activity });
  } catch (e) {
    res.status(500).json({ success: false, message: "發布失敗" });
  }
});
// 5. 申請報帳 API
router.post('/create-expense', async (req, res) => {
  try {
    const { activityId, item, amount } = req.body;
    const expense = await prisma.expense.create({
      data: {
        item,
        amount: parseInt(amount),
        activityId: parseInt(activityId)
      }
    });
    res.json({ success: true, message: "報帳申請已送出", expense });
  } catch (e) {
    res.status(500).json({ success: false, message: "申請失敗" });
  }
});

// 6. 審核經費 API (核准/駁回)
router.post('/approve-expense', async (req, res) => {
  try {
    const { expenseId, action } = req.body; // action 會是 "approved" 或 "rejected"
    const updated = await prisma.expense.update({
      where: { id: parseInt(expenseId) },
      data: { status: action }
    });
    res.json({ success: true, message: `已更新狀態為: ${action}`, expense: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: "審核失敗" });
  }
});
// 把這個管理員匯出，讓 server.js 可以用
module.exports = router;