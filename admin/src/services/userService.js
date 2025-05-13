import { httpClient, apiUrl } from './httpClient';
import { formatError, formatSuccess, formatSearchParams } from './utils';

const userService = {
  getList: async ({ page = 1, pageSize = 10, search = '', role = '', sortBy = 'createdAt', sortOrder = 'desc' }) => {
    try {
      const queryParams = formatSearchParams({
        page,
        pageSize,
        search,
        role,
        sortBy,
        sortOrder
      });      const { json: response } = await httpClient(`${apiUrl}/users?${queryParams}`);
      // Kiểm tra và chuẩn hóa dữ liệu trả về
      const users = response.users || response.data || response || [];
      const pagination = response.pagination || {};
      return formatSuccess({
        data: users,
        pagination
      });
    } catch (error) {
      throw formatError('Lỗi khi tải danh sách người dùng', error);
    }
  },  getOne: async (id) => {
    try {
      // Đảm bảo id là số
      const userId = typeof id === 'string' ? parseInt(id) : id;
      if (isNaN(userId)) {
        throw new Error('ID người dùng không hợp lệ');
      }
      const { json: response } = await httpClient(`${apiUrl}/users/${userId}`);
      return formatSuccess(response);
    } catch (error) {
      throw formatError('Lỗi khi tải thông tin người dùng', error);
    }
  },

  create: async (userData) => {
    try {
      const { json: response } = await httpClient(`${apiUrl}/users`, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return formatSuccess(response, 'Tạo người dùng thành công');
    } catch (error) {
      throw formatError('Lỗi khi tạo người dùng', error);
    }
  },

  update: async (id, userData) => {
    try {
      const { json: response } = await httpClient(`${apiUrl}/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      return formatSuccess(response, 'Cập nhật thông tin người dùng thành công');
    } catch (error) {
      throw formatError('Lỗi khi cập nhật thông tin người dùng', error);
    }
  },

  delete: async (id) => {
    try {
      await httpClient(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
      });
      return formatSuccess(null, 'Xóa người dùng thành công');
    } catch (error) {
      throw formatError('Lỗi khi xóa người dùng', error);
    }
  },

  uploadAvatar: async (id, file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const { json: response } = await httpClient(`${apiUrl}/users/upload-avatar`, {
        method: 'POST',
        body: formData,
      });
      return formatSuccess(response, 'Upload avatar thành công');
    } catch (error) {
      throw formatError('Lỗi khi upload avatar', error);
    }
  },

  getUserTickets: async (userId, { page = 1, pageSize = 10, status }) => {
    try {
      const queryParams = formatSearchParams({
        page,
        pageSize,
        ...(status && { status })
      });

      const { json: response } = await httpClient(`${apiUrl}/users/${userId}/my-tickets?${queryParams}`);
      return formatSuccess({
        data: response.tickets,
        pagination: response.pagination
      });
    } catch (error) {
      throw formatError('Lỗi khi tải lịch sử đặt vé', error);
    }
  },

  getUserReviews: async (userId, { page = 1, pageSize = 10 }) => {
    try {
      const queryParams = formatSearchParams({
        page,
        pageSize
      });

      const { json: response } = await httpClient(`${apiUrl}/users/${userId}/my-reviews?${queryParams}`);
      return formatSuccess({
        data: response.reviews,
        pagination: response.pagination
      });
    } catch (error) {
      throw formatError('Lỗi khi tải lịch sử đánh giá', error);
    }
  },

  resetUserPassword: async (userId, newPassword) => {
    try {
      const { json: response } = await httpClient(`${apiUrl}/users/${userId}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
      return formatSuccess(response, 'Đặt lại mật khẩu thành công');
    } catch (error) {
      throw formatError('Lỗi khi đặt lại mật khẩu', error);
    }
  },

  exportUsers: async (filters) => {
    try {
      const queryParams = formatSearchParams(filters);
      const { json: response } = await httpClient(`${apiUrl}/users/export?${queryParams}`, {
        headers: {
          Accept: 'application/octet-stream',
        },
      });
      return formatSuccess(response, 'Export dữ liệu thành công');
    } catch (error) {
      throw formatError('Lỗi khi export dữ liệu người dùng', error);
    }
  },

  updateUserStatus: async (userId, status) => {
    try {
      const { json: response } = await httpClient(`${apiUrl}/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return formatSuccess(response, 'Cập nhật trạng thái người dùng thành công');
    } catch (error) {
      throw formatError('Lỗi khi cập nhật trạng thái người dùng', error);
    }
  }
};

export default userService;
