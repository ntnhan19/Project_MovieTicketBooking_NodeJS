// admin/src/services/dashboardService.js
import { apiUrl, httpClient } from './httpClient';

/**
 * Service để lấy dữ liệu dashboard từ API
 */
const getDashboardData = async () => {
  try {
    const { json } = await httpClient(`${apiUrl}/dashboard`);
    return json;
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dashboard:', error);
    throw error;
  }
};

const dashboardService = {
  getDashboardData
};

export default dashboardService;