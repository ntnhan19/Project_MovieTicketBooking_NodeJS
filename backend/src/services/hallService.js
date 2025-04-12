//backend/src/services/hallService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAll = () => prisma.hall.findMany();
exports.getById = (id) => prisma.hall.findUnique({ where: { id } });
exports.create = (data) => prisma.hall.create({ data });
exports.update = (id, data) => prisma.hall.update({ where: { id }, data });
exports.delete = (id) => prisma.hall.delete({ where: { id } });
