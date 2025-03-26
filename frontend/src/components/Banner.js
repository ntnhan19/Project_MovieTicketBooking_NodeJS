import React from "react";
import { Carousel } from "antd";

const Banner = () => {
  return (
    <Carousel autoplay>
      <div>
        <img
          src="/images/banner1.jpg"
          alt="Banner 1"
          className="w-full h-[500px] object-cover"
        />
      </div>
      <div>
        <img
          src="/images/banner2.jpg"
          alt="Banner 2"
          className="w-full h-[500px] object-cover"
        />
      </div>
      <div>
        <img
          src="/images/banner3.jpg"
          alt="Banner 3"
          className="w-full h-[500px] object-cover"
        />
      </div>
    </Carousel>
  );
};

export default Banner;
