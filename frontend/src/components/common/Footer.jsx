import React from "react";
import { 
  FacebookOutlined, 
  YoutubeOutlined, 
  InstagramOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined 
} from "@ant-design/icons";

const Footer = () => {
  return (
    <footer className="w-full bg-[#111111] text-white py-12">
      <div className="max-w-6xl mx-auto px-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Về Chúng Tôi */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Về Chúng Tôi
            </h3>
            <p className="text-white/70 leading-relaxed mt-6">
              DHL Cinema - Hệ thống rạp chiếu phim hiện đại với những công nghệ chiếu phim tân tiến và dịch vụ khách hàng tốt nhất.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-colors">
                <FacebookOutlined />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-colors">
                <InstagramOutlined />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-colors">
                <YoutubeOutlined />
              </a>
            </div>
          </div>

          {/* Liên Kết Nhanh */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Liên Kết Nhanh
            </h3>
            <ul className="mt-6 space-y-3">
              <li>
                <a href="/movies" className="text-white/70 hover:text-primary transition-colors">Phim Đang Chiếu</a>
              </li>
              <li>
                <a href="/movies?type=coming-soon" className="text-white/70 hover:text-primary transition-colors">Phim Sắp Chiếu</a>
              </li>
              <li>
                <a href="/promotions" className="text-white/70 hover:text-primary transition-colors">Khuyến Mãi</a>
              </li>
              <li>
                <a href="/about" className="text-white/70 hover:text-primary transition-colors">Về Chúng Tôi</a>
              </li>
              <li>
                <a href="/faq" className="text-white/70 hover:text-primary transition-colors">Câu Hỏi Thường Gặp</a>
              </li>
            </ul>
          </div>

          {/* Rạp Chiếu */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Rạp Chiếu
            </h3>
            <ul className="mt-6 space-y-3">
              <li className="text-white/70">
                <EnvironmentOutlined className="mr-2 text-primary" /> DHL Quận 1
              </li>
              <li className="text-white/70">
                <EnvironmentOutlined className="mr-2 text-primary" /> DHL Thủ Đức
              </li>
              <li className="text-white/70">
                <EnvironmentOutlined className="mr-2 text-primary" /> DHL Gò Vấp
              </li>
              <li className="text-white/70">
                <EnvironmentOutlined className="mr-2 text-primary" /> DHL Tân Bình
              </li>
            </ul>
          </div>

          {/* Liên Hệ */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:absolute after:bottom-[-10px] after:left-0 after:w-12 after:h-0.5 after:bg-primary">
              Liên Hệ
            </h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-center text-white/70">
                <MailOutlined className="mr-3 text-lg text-primary" /> 
                <span>dhlcinema@gmail.com</span>
              </li>
              <li className="flex items-center text-white/70">
                <PhoneOutlined className="mr-3 text-lg text-primary" /> 
                <span>0344632293</span>
              </li>
              <li className="flex items-start text-white/70">
                <EnvironmentOutlined className="mr-3 text-lg mt-1 text-primary" /> 
                <span>31 Quốc Hương, Phường Thảo Điền, TP. Thủ Đức, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-white/50">© 2025 DHL Cinema. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;