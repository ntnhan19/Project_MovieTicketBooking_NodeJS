import { useState, useEffect } from 'react';
import { useGetIdentity, useNotify, useRedirect } from 'react-admin';
import { httpClient, apiUrl } from '../../services/httpClient';
import { formatError, formatSuccess } from '../../services/utils';
import { 
  UserCircleIcon,
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowUpIcon,
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ProfilePage = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const notify = useNotify();
  const redirect = useRedirect();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    if (identity) {
      console.log('Identity data:', identity); // Debug để kiểm tra dữ liệu identity
      setUserData({
        name: identity.fullName || identity.name || '',
        email: identity.email || '',
        phone: identity.phone || '',
      });
    }
  }, [identity]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await httpClient(`${apiUrl}/users/${identity.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      notify(formatSuccess(response.json, 'Cập nhật thông tin thành công').message, { type: 'success' });
      setIsEditing(false);
    } catch (error) {
      notify(formatError('Lỗi khi cập nhật thông tin', error).message, { type: 'error' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notify('Mật khẩu mới và xác nhận mật khẩu không khớp', { type: 'error' });
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      notify('Mật khẩu mới phải có ít nhất 8 ký tự', { type: 'error' });
      return;
    }

    if (!/[A-Z]/.test(passwordData.newPassword)) {
      notify('Mật khẩu mới phải chứa ít nhất 1 chữ in hoa', { type: 'error' });
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      notify('Mật khẩu mới phải chứa ít nhất 1 chữ số', { type: 'error' });
      return;
    }

    try {
      await httpClient(`${apiUrl}/users/${identity.id}/change-password`, {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      notify('Đổi mật khẩu thành công', { type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      notify(formatError('Lỗi khi đổi mật khẩu', error).message, { type: 'error' });
    }
  };

  const handleRipple = (e) => {
    const btn = e.currentTarget;
    btn.style.setProperty('--ripple-x', `${e.clientX - btn.getBoundingClientRect().left}px`);
    btn.style.setProperty('--ripple-y', `${e.clientY - btn.getBoundingClientRect().top}px`);
  };

  if (identityLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-dark-bg flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-16 w-16"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:bg-dark-bg py-8">
      {/* Container rộng hơn */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="page-header relative rounded-2xl shadow-xl p-8 mb-12 overflow-hidden backdrop-blur-sm"
          style={{ boxShadow: '0 4px 12px rgba(231, 26, 15, 0.2)' }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark rounded-2xl opacity-70 dark:from-red-600 dark:to-red-700"
          ></div>
          <div className="flex flex-col gap-6 mb-4 text-center relative z-10">
            <h1
              className="text-4xl font-bold text-white drop-shadow-lg animate-slideUp"
            >
              Hồ Sơ Quản Trị Viên
            </h1>
            <div
              className="text-sm italic animate-fadeIn text-white"
            >
              Quản lý thông tin và cài đặt bảo mật tài khoản của bạn!
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-2 min-w-80"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-6">
              {/* User Info Section */}
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <UserCircleIcon className="w-28 h-28 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
                  {userData.name || 'Chưa có tên'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Quản trị viên
                </p>
              </div>

              {/* Navigation */}
              <nav className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ripple-btn ${
                    activeTab === 'profile'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
                  }`}
                  onClickCapture={handleRipple}
                >
                  <UserCircleIcon className="w-5 h-5 mr-3" />
                  Thông tin cá nhân
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200 ripple-btn ${
                    activeTab === 'security'
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500'
                  }`}
                  onClickCapture={handleRipple}
                >
                  <ShieldCheckIcon className="w-5 h-5 mr-3" />
                  Bảo mật
                </motion.button>
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="xl:col-span-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                      Thông tin cá nhân
                    </h2>
                    {!isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md ripple-btn"
                        onClickCapture={handleRipple}
                      >
                        <PencilIcon className="w-5 h-5 mr-2" />
                        Chỉnh sửa
                      </motion.button>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Họ và tên
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            value={userData.name}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className={`w-full px-4 py-4 border rounded-lg transition-all duration-200 text-gray-800 dark:text-gray-200 ${
                              isEditing 
                                ? 'border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:scale-105' 
                                : 'border-transparent bg-gray-50 dark:bg-gray-700'
                            } bg-white dark:bg-gray-800 text-lg`}
                            placeholder="Nhập họ và tên"
                          />
                          {!isEditing && (
                            <UserCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-300" />
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          disabled={true}
                          className="w-full px-4 py-4 border rounded-lg transition-all duration-200 border-transparent bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-lg"
                          placeholder="Nhập địa chỉ email"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Số điện thoại
                        </label>
                        <input
                          type="text"
                          name="phone"
                          value={userData.phone}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full px-4 py-4 border rounded-lg transition-all duration-200 text-gray-800 dark:text-gray-200 ${
                            isEditing 
                              ? 'border-gray-200 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:scale-105' 
                              : 'border-transparent bg-gray-50 dark:bg-gray-700'
                          } bg-white dark:bg-gray-800 text-lg`}
                          placeholder="Nhập số điện thoại"
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="submit"
                          className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md ripple-btn"
                          onClickCapture={handleRipple}
                        >
                          <CheckIcon className="w-5 h-5 mr-2" />
                          Lưu thay đổi
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="flex items-center px-8 py-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-all duration-200 font-medium shadow-md ripple-btn"
                          onClickCapture={handleRipple}
                        >
                          <XMarkIcon className="w-5 h-5 mr-2" />
                          Hủy bỏ
                        </motion.button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6 md:p-8">
                  <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-8">
                    Bảo mật tài khoản
                  </h2>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-600 rounded-lg p-6 mb-8"
                  >
                    <div className="flex items-start">
                      <ShieldCheckIcon className="w-6 h-6 text-red-500 dark:text-red-400 mt-0.5 mr-4 flex-shrink-0" />
                      <div>
                        <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                          Lưu ý bảo mật
                        </h3>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 list-disc pl-5">
                          <li>Mật khẩu phải có ít nhất 8 ký tự</li>
                          <li>Phải bao gồm ít nhất 1 chữ in hoa và 1 chữ số</li>
                          <li>Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                          <li>Không sử dụng thông tin cá nhân như ngày sinh, tên, số điện thoại</li>
                          <li>Nên thay đổi mật khẩu định kỳ (3-6 tháng/lần)</li>
                        </ul>
                      </div>
                    </div>
                  </motion.div>

                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Mật khẩu hiện tại
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:scale-105 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-200 text-lg"
                          placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors duration-200"
                        >
                          {showCurrentPassword ? (
                            <EyeSlashIcon className="w-6 h-6" />
                          ) : (
                            <EyeIcon className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:scale-105 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-200 text-lg"
                          placeholder="Nhập mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors duration-200"
                        >
                          {showNewPassword ? (
                            <EyeSlashIcon className="w-6 h-6" />
                          ) : (
                            <EyeIcon className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Xác nhận mật khẩu mới
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="w-full px-4 py-4 pr-12 border border-gray-200 dark:border-gray-600 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:scale-105 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-all duration-200 text-lg"
                          placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300 hover:text-red-500 transition-colors duration-200"
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-6 h-6" />
                          ) : (
                            <EyeIcon className="w-6 h-6" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-200 dark:border-gray-600">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg transition-all duration-200 font-medium shadow-md ripple-btn"
                        onClickCapture={handleRipple}
                      >
                        <ShieldCheckIcon className="w-5 h-5 mr-2" />
                        Đổi mật khẩu
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => {
            handleRipple(e);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="fixed bottom-8 right-8 bg-red-500 dark:bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-600 dark:hover:bg-red-700 transition-all ripple-btn"
        >
          <ArrowUpIcon className="text-xl" />
        </motion.button>
      )}
    </div>
  );
};

export default ProfilePage;