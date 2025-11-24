const express = require('express');
const router = express.Router();
const prisma = require('../db');

// 1. 取得資料 API
router.get('/club-center', async (req, res) => {
  try {
    const clubs = await prisma.club.findMany({
      include: {
        members: { include: { user: true } },
        activities: { include: { expenses: true } }
      }
    });
    res.json({ success: true, clubs });
  } catch (e) {
    res.status(500).json({ success: false, message: "讀取失敗" });
  }
});

// 2. 建立舞碼群組 API (支援介紹與地點)
router.post('/create-club', async (req, res) => {
  try {
    const { name, description, location } = req.body;
    const newClub = await prisma.club.create({
      data: { name, description, location }
    });
    res.json({ success: true, message: "群組建立成功", club: newClub });
  } catch (error) {
    res.status(500).json({ success: false, message: "建立失敗" });
  }
});

// 3. 加入群組 API
router.post('/join-club', async (req, res) => {
  try {
    const { userId, clubId } = req.body;
    const existing = await prisma.clubMember.findFirst({
      where: { userId: parseInt(userId), clubId: parseInt(clubId) }
    });
    if (existing) return res.json({ success: false, message: "您已經是成員了！" });

    await prisma.clubMember.create({
      data: { userId: parseInt(userId), clubId: parseInt(clubId) }
    });
    res.json({ success: true, message: "加入成功！" });
  } catch (e) {
    res.status(500).json({ success: false, message: "加入失敗" });
  }
});

// 4. 發布日程 API (支援類型 type)
router.post('/create-activity', async (req, res) => {
  try {
    const { clubId, title, date, content, type } = req.body;
    const activity = await prisma.activity.create({
      data: {
        title,
        date,
        content,
        type: type || 'rehearsal', // 預設為排練
        clubId: parseInt(clubId)
      }
    });
    res.json({ success: true, message: "日程發布成功", activity });
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

// 6. 審核經費 API
router.post('/approve-expense', async (req, res) => {
  try {
    const { expenseId, action } = req.body;
    const updated = await prisma.expense.update({
      where: { id: parseInt(expenseId) },
      data: { status: action }
    });
    res.json({ success: true, message: `已更新狀態`, expense: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: "審核失敗" });
  }
});

module.exports = router;