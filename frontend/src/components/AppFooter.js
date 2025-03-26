import { Layout, Row, Col, Typography, Space } from "antd";
import {
  FacebookOutlined,
  YoutubeOutlined,
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
} from "@ant-design/icons";

const { Footer } = Layout;
const { Title, Text } = Typography;

const AppFooter = () => {
  return (
    <Footer style={{ background: "#001529", color: "#fff", padding: "40px 0" }}>
      <Row justify="center" gutter={[48, 24]}>
        {/* Cột 1: Giới thiệu */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff" }}>
            Về Chúng Tôi
          </Title>
          <Text style={{ color: "#ccc" }}>
            Trang web cung cấp thông tin phim mới nhất, lịch chiếu và đánh giá
            từ khán giả.
          </Text>
        </Col>

        {/* Cột 2: Liên hệ */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff" }}>
            Liên Hệ
          </Title>
          <Space direction="vertical">
            <Text style={{ color: "#ccc" }}>
              <MailOutlined /> DHLCinema@gmail.com
            </Text>
            <Text style={{ color: "#ccc" }}>
              <PhoneOutlined /> 0344632293
            </Text>
          </Space>
        </Col>

        {/* Cột 3: Mạng xã hội */}
        <Col xs={24} sm={12} md={8} lg={6}>
          <Title level={4} style={{ color: "#fff" }}>
            Kết Nối
          </Title>
          <Space size="large">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FacebookOutlined
                style={{ fontSize: "24px", color: "#1890ff" }}
              />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <YoutubeOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <InstagramOutlined
                style={{ fontSize: "24px", color: "#ff85c0" }}
              />
            </a>
          </Space>
        </Col>
      </Row>

      {/* Copyright */}
      <Row justify="center" style={{ marginTop: "40px" }}>
        <Text style={{ color: "#ccc" }}>
          © 2025 DHL CINEMA. All rights reserved.
        </Text>
      </Row>
    </Footer>
  );
};

export default AppFooter;
