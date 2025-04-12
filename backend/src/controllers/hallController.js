//backend/src/controllers/hallController.js
const hallService = require('../services/hallService');

exports.getAllHalls = async (req, res) => {
  const halls = await hallService.getAll();
  res.json(halls);
};

exports.getHallById = async (req, res) => {
  const hall = await hallService.getById(Number(req.params.id));
  res.json(hall);
};

exports.createHall = async (req, res) => {
  const hall = await hallService.create(req.body);
  res.json(hall);
};

exports.updateHall = async (req, res) => {
  const hall = await hallService.update(Number(req.params.id), req.body);
  res.json(hall);
};

exports.deleteHall = async (req, res) => {
  await hallService.delete(Number(req.params.id));
  res.json({ message: 'Deleted' });
};
