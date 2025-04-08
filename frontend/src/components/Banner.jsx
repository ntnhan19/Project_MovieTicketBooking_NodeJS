import React from "react";
import { Carousel } from "antd";

const bannerData = [
  {
    image: "/images/banner1.jpg",
    title: "AVATAR: THE WAY OF WATER",
    genre: "Phiêu lưu, Khoa học viễn tưởng",
    duration: "192 phút",
    trailer: "https://www.youtube.com/embed/d9MyW72ELq0",
    id: 1,
  },
  {
    image: "/images/banner2.jpg",
    title: "TÊN PHIM 2",
    genre: "Hành động, Kịch tính",
    duration: "130 phút",
    trailer: "https://www.youtube.com/embed/xyz456",
    id: 2,
  },
  {
    image: "/images/banner3.jpg",
    title: "TÊN PHIM 3",
    genre: "Hoạt hình, Gia đình",
    duration: "105 phút",
    trailer: "https://www.youtube.com/embed/abc123",
    id: 3,
  },
];

const Banner = () => {
  return (
    <div className="banner-wrapper">
      <Carousel autoplay dotPosition="bottom">
        {bannerData.map((item, index) => (
          <div key={index} className="banner-slide">
            <img
              src={item.image}
              alt={`Banner ${index + 1}`}
              className="banner-image"
            />
          </div>
        ))}
      </Carousel>
    </div>
  );
};

export default Banner;
