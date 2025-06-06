import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Divider } from 'antd';
import { 
  LockOutlined, 
  KeyOutlined, 
  EyeInvisibleOutlined, 
  EyeTwoTone, 
  SafetyOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const PasswordChangeCard = () => {
  const { changePassword, user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const { currentPassword, newPassword, confirmPassword } = values;

      if (newPassword !== confirmPassword) {
        message.error('Mật khẩu mới và xác nhận mật khẩu không khớp!');
        return;
      }

      const result = await changePassword({
        userId: user?.id,
        currentPassword,
        newPassword,
      });

      if (result.success) {
        message.success('Đổi mật khẩu thành công!');
        form.resetFields(['currentPassword', 'newPassword', 'confirmPassword']);
      } else {
        message.error('Đổi mật khẩu thất bại. Vui lòng kiểm tra lại thông tin!');
      }
    } catch (error) {
      message.error('Lỗi khi đổi mật khẩu. Vui lòng thử lại!');
      console.error('Error changing password:', error);
    } finally {
      setLoading(false);
    }
  };

  const passwordRules = [
    {
      validator: (_, value) => {
        if (!value || value.length >= 8) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu phải có ít nhất 8 ký tự!'));
      }
    },
    {
      validator: (_, value) => {
        if (!value || /[A-Z]/.test(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ in hoa!'));
      }
    },
    {
      validator: (_, value) => {
        if (!value || /[0-9]/.test(value)) {
          return Promise.resolve();
        }
        return Promise.reject(new Error('Mật khẩu phải chứa ít nhất 1 chữ số!'));
      }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        title={
          <div className="flex items-center text-lg font-medium text-gray-800 dark:text-white">
            <KeyOutlined className="mr-2 text-red-500 dark:text-red-400" /> 
            Đổi mật khẩu
          </div>
        }
        className="rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600"
      >
        <Form
          form={form}
          layout="vertical"
          name="password_form"
          onFinish={handleChangePassword}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              name="currentPassword"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Mật khẩu hiện tại</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
                placeholder="Nhập mật khẩu hiện tại"
                className="form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Mật khẩu mới</span>}
              rules={[
                { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                ...passwordRules
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
                placeholder="Nhập mật khẩu mới"
                className="form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label={<span className="text-gray-700 dark:text-gray-300 font-medium">Xác nhận mật khẩu mới</span>}
              rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400 dark:text-gray-300 mr-2" />}
                placeholder="Xác nhận mật khẩu mới"
                className="form-input rounded-lg shadow-sm border-gray-200 dark:border-gray-600"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              />
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SafetyOutlined />}
                className="ripple-btn bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                Cập nhật mật khẩu
              </Button>
            </motion.div>
          </Form.Item>
        </Form>

        <Divider className="border-gray-200 dark:border-gray-600" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-gray-700 dark:to-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
        >
          <h4 className="font-medium flex items-center text-gray-800 dark:text-gray-200">
            <SafetyOutlined className="mr-2 text-red-500 dark:text-red-400" />
            Lưu ý bảo mật
          </h4>
          <ul className="text-sm list-disc pl-5 mt-2 text-gray-600 dark:text-gray-300">
            <li>Mật khẩu phải có ít nhất 8 ký tự</li>
            <li>Nên bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</li>
            <li>Không sử dụng thông tin cá nhân như ngày sinh, tên, số điện thoại</li>
            <li>Nên thay đổi mật khẩu định kỳ (3-6 tháng một lần)</li>
            <li>Không sử dụng lại mật khẩu từ các tài khoản khác</li>
          </ul>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default PasswordChangeCard;