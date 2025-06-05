// backend/src/prisma/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  transactionOptions: {
    timeout: 30000, 
    maxWait: 5000,
    isolationLevel: 'ReadCommitted'
  }
});

module.exports = prisma;