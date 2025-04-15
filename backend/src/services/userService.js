// backend/src/services/userService.js
const prisma = require('../../prisma/prisma');
const bcrypt = require('bcrypt');

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const getUserById = async (id) => {
  return await prisma.user.findUnique({ where: { id } });
};

const createUser = async (data) => {
  const { password, ...rest } = data;
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: { ...rest, password: hashedPassword },
  });
};

const updateUser = async (id, data) => {
  return await prisma.user.update({
    where: { id },
    data,
  });
};

const deleteUser = async (id) => {
  return await prisma.user.delete({ where: { id } });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };
