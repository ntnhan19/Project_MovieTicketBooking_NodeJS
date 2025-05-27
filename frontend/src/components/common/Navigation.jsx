import React from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";

const Navigation = ({ items, activeKey, theme }) => {
  return (
    <Menu
      mode="horizontal"
      selectedKeys={[activeKey]}
      className="bg-transparent border-b-0 dark:bg-gray-900 custom-header-menu"
      style={{
        fontWeight: 500,
        fontSize: "15px",
        backgroundColor: theme === "dark" ? "#111827" : undefined,
        color: theme === "dark" ? "#ffffff" : "#333333",
        maxWidth: "600px",
      }}
      items={items.map((item) => ({
        ...item,
        label: (
          <span className="relative group">
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 dark:bg-red-400 transition-all group-hover:w-full"></span>
          </span>
        ),
      }))}
      override={{ inkBar: { display: "none" } }}
    />
  );
};

export default Navigation;