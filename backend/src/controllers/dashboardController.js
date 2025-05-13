// backend/src/controllers/dashboardController.js
const dashboardService = require('../services/dashboardService');

/**
 * Lấy dữ liệu tổng quan cho dashboard
 */
const getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Chỉ admin mới có quyền xem dashboard
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    const dashboardData = await dashboardService.getDashboardData();
    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    return res.status(500).json({ 
      message: 'Đã xảy ra lỗi khi lấy dữ liệu dashboard', 
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardData
};