// frontend/src/components/CustomerInfoForm.jsx
import React from 'react';
import { Form, Input, Row, Col } from 'antd';

const CustomerInfoForm = ({ form }) => {
  return (
    <Form 
      form={form} 
      layout="vertical" 
      requiredMark="optional"
      className="customer-info-form"
    >
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item 
            name="fullName" 
            label="Họ và tên" 
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input placeholder="Nhập họ và tên" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item 
            name="phone" 
            label="Số điện thoại" 
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại' },
              { pattern: new RegExp(/^(0[3|5|7|8|9])+([0-9]{8})$/), message: 'Số điện thoại không hợp lệ' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item 
        name="email" 
        label="Email" 
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <Input placeholder="Nhập email" />
      </Form.Item>
      <Form.Item 
        name="notes" 
        label="Ghi chú (nếu có)"
      >
        <Input.TextArea 
          placeholder="Nhập ghi chú nếu có yêu cầu đặc biệt" 
          rows={4}
        />
      </Form.Item>
    </Form>
  );
};

export default CustomerInfoForm;