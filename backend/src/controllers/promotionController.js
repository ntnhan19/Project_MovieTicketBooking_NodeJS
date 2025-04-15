// backend/src/controllers/promotionController.js
const promotionService = require("../services/promotionService");

const getAllPromotions = async (req, res) => {
  try {
    const promotions = await promotionService.getAllPromotions();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch promotions" });
  }
};

const getPromotionById = async (req, res) => {
  try {
    const promotion = await promotionService.getPromotionById(req.params.id);
    if (!promotion) {
      return res.status(404).json({ error: "Promotion not found" });
    }
    res.json(promotion);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch promotion" });
  }
};

const createPromotion = async (req, res) => {
  try {
    const newPromotion = await promotionService.createPromotion(req.body);
    res.status(201).json(newPromotion);
  } catch (error) {
    res.status(500).json({ error: "Failed to create promotion" });
  }
};

const updatePromotion = async (req, res) => {
  try {
    const updatedPromotion = await promotionService.updatePromotion(
      req.params.id,
      req.body
    );
    res.json(updatedPromotion);
  } catch (error) {
    res.status(500).json({ error: "Failed to update promotion" });
  }
};

const deletePromotion = async (req, res) => {
  try {
    await promotionService.deletePromotion(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete promotion" });
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
