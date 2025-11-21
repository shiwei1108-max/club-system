// 引入這層目錄下的 prisma-client 資料夾
const { PrismaClient } = require('./prisma-client');

const prisma = new PrismaClient();

module.exports = prisma;