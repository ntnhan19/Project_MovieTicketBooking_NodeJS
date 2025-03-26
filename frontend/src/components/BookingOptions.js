import React from "react";
import { Menu, Dropdown, Button, Row, Col } from "antd";
import { DownOutlined } from "@ant-design/icons";

const dropdownMenu = (items) => (
  <Menu>
    {items.map((item, index) => (
      <Menu.Item key={index}>{item}</Menu.Item>
    ))}
  </Menu>
);

const BookingOptions = () => {
  return (
    <Row gutter={16} justify="center" style={{ marginTop: "20px" }}>
      {/* Chọn rạp */}
      <Col>
        <Dropdown
          overlay={dropdownMenu(["Rạp 1", "Rạp 2", "Rạp 3"])}
          trigger={["click"]}
        >
          <Button style={styles.button}>
            Chọn rạp <DownOutlined />
          </Button>
        </Dropdown>
      </Col>

      {/* Chọn phim */}
      <Col>
        <Dropdown
          overlay={dropdownMenu(["Phim A", "Phim B", "Phim C"])}
          trigger={["click"]}
        >
          <Button style={styles.button}>
            Chọn phim <DownOutlined />
          </Button>
        </Dropdown>
      </Col>

      {/* Chọn ngày */}
      <Col>
        <Dropdown
          overlay={dropdownMenu(["Hôm nay", "Ngày mai", "Cuối tuần"])}
          trigger={["click"]}
        >
          <Button style={styles.button}>
            Chọn Ngày xem <DownOutlined />
          </Button>
        </Dropdown>
      </Col>

      {/* Chọn suất chiếu */}
      <Col>
        <Dropdown
          overlay={dropdownMenu(["10:00 AM", "2:00 PM", "8:00 PM"])}
          trigger={["click"]}
        >
          <Button style={styles.button}>
            Chọn suất chiếu <DownOutlined />
          </Button>
        </Dropdown>
      </Col>
    </Row>
  );
};

// Styles
const styles = {
  button: {
    backgroundColor: "black",
    color: "white",
    border: "2px solid white",
    borderRadius: "8px",
    fontSize: "16px",
    padding: "10px 20px",
  },
};

export default BookingOptions;
