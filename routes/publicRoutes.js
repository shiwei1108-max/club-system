const express = require('express');
const router = express.Router();
const prisma = require('../db');

// 取得公開的活動行事曆 (只抓今天以後的)
router.get('/events', async (req, res) => {
  try {
    // 取得今天日期 (格式 YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    const events = await prisma.activity.findMany({
      where: { 
        date: { gte: today } // gte = Greater Than or Equal (大於等於今天)
      },
      orderBy: { date: 'asc' } // 按日期排序
    });
    
    res.json({ success: true, events });
  } catch (e) {
    res.status(500).json({ success: false, message: "讀取失敗" });
  }
});

module.exports = router;