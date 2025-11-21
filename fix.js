// ★ 修正這裡：引用我們自訂路徑的 Prisma 客戶端
const { PrismaClient } = require('./prisma-client');
const prisma = new PrismaClient();

async function main() {
  console.log("⏳ 正在連線雲端資料庫...");
  
  // 強制把所有社員都變成 admin (社長)
  const result = await prisma.clubMember.updateMany({
    data: { role: 'admin' }
  });
  
  console.log(`✅ 成功！已將 ${result.count} 筆成員資料升級為社長 (Admin)！`);
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });