//BookingOptions.jsx
import React from "react";
import { Menu, Dropdown, Button, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "../index.css";

const dropdownMenu = (items) => (
  <Menu>
    {items.map((item, index) => (
      <Menu.Item key={index}>{item}</Menu.Item>
    ))}
  </Menu>
);

const BookingOptions = () => {
  return (
    <div className="booking-container">
      <Row gutter={15} justify="center">
        <Col>
          <Dropdown
            overlay={dropdownMenu(["Rạp 1", "Rạp 2", "Rạp 3"])}
            trigger={["click"]}
          >
            <Button className="booking-dropdown-button">
              1. Chọn Rạp <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
        <Col>
          <Dropdown
            overlay={dropdownMenu(["Phim A", "Phim B", "Phim C"])}
            trigger={["click"]}
          >
            <Button className="booking-dropdown-button">
              2. Chọn Phim <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
        <Col>
          <Dropdown
            overlay={dropdownMenu(["Hôm nay", "Ngày mai", "Cuối tuần"])}
            trigger={["click"]}
          >
            <Button className="booking-dropdown-button">
              3. Chọn Ngày <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
        <Col>
          <Dropdown
            overlay={dropdownMenu(["10:00 AM", "2:00 PM", "8:00 PM"])}
            trigger={["click"]}
          >
            <Button className="booking-dropdown-button">
              4. Chọn Suất <DownOutlined />
            </Button>
          </Dropdown>
        </Col>
        <Col>
          <Button className="booking-now-button">ĐẶT NGAY</Button>
        </Col>
      </Row>
    </div>
  );
};
export default BookingOptions;
