// frontend/src/components/common/Footer.jsx
import { 
  FacebookOutlined, 
  YoutubeOutlined, 
  InstagramOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined,
  RightOutlined
} from "@ant-design/icons";
import { useState } from "react";

const Footer = () => {
  const [emailValue, setEmailValue] = useState("");
  
  const handleSubscribe = (e) => {
    e.preventDefault();
    // Xử lý logic đăng ký nhận thông báo
    alert(`Cảm ơn bạn đã đăng ký với email: ${emailValue}`);
    setEmailValue("");
  };

  return (
    <footer className="w-full bg-gradient-to-b from-[#0a0a0a] to-[#141414] text-white pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-5">
        {/* Upper section với logo và form đăng ký */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-8">
          <div className="flex items-center">
            <div className="relative bg-primary-light rounded-lg p-3 mr-4 overflow-hidden shadow-lg">
              <span className="text-3xl relative z-10">🎬</span>
              <div className="absolute inset-0 bg-button-gradient opacity-80"></div>
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
                DHL Cinema
              </h2>
              <p className="text-sm text-gray-400">Trải nghiệm điện ảnh đỉnh cao</p>
            </div>
          </div>
          
          {/* Form đăng ký */}
          <div className="w-full md:w-auto">
            <form onSubmit={handleSubscribe} className="flex items-stretch">
              <input
                type="email"
                placeholder="Nhập email để nhận thông báo phim mới"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 text-gray-200 px-4 py-3 rounded-l-lg w-full md:w-72 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary-light"
                required
              />
              <button
                type="submit"
                className="bg-button-gradient hover:bg-button-gradient-hover px-5 py-3 rounded-r-lg font-medium shadow-button hover:shadow-button-hover transition-all transform hover:-translate-y-0.5"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
        
        {/* Đường kẻ sáng với hiệu ứng gradient */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-12"></div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
          {/* Thông tin về DHL Cinema */}
          <div className="md:col-span-4 space-y-6">
            <div>
              <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
                Về DHL Cinema
                <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary"></span>
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Hệ thống rạp chiếu phim hiện đại tại Việt Nam với những công nghệ 
                chiếu phim tân tiến. Chúng tôi mang đến cho bạn trải nghiệm điện ảnh 
                đỉnh cao với âm thanh Dolby Atmos và hình ảnh 4K sắc nét.
              </p>
            </div>
            
            {/* Social media icons */}
            <div className="pt-2">
              <h4 className="text-sm font-medium mb-3 text-gray-400">Kết nối với chúng tôi</h4>
              <div className="flex space-x-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-button group">
                  <FacebookOutlined className="text-lg group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-button group">
                  <InstagramOutlined className="text-lg group-hover:scale-110 transition-transform" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" 
                  className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 hover:shadow-button group">
                  <YoutubeOutlined className="text-lg group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Liên kết & thông tin */}
          <div className="md:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
                Liên kết
                <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary"></span>
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/movies" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>Phim Đang Chiếu</span>
                  </a>
                </li>
                <li>
                  <a href="/movies?type=coming-soon" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>Phim Sắp Chiếu</span>
                  </a>
                </li>
                <li>
                  <a href="/promotions" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>Khuyến Mãi</span>
                  </a>
                </li>
                <li>
                  <a href="/membership" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>Thành Viên</span>
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>Về Chúng Tôi</span>
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
                Rạp chiếu
                <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary"></span>
              </h3>
              <ul className="space-y-3">
                <li>
                  <a href="/theaters/quan-1" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>DHL Cinema Gò Vấp</span>
                  </a>
                </li>
                <li>
                  <a href="/theaters/thu-duc" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>DHL Cinema Nguyễn Huệ</span>
                  </a>
                </li>
                <li>
                  <a href="/theaters/go-vap" className="text-gray-300 hover:text-primary transition-colors flex items-center group">
                    <RightOutlined className="mr-2 text-xs opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                    <span>DHL Cinema Times City</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Liên hệ */}
          <div className="md:col-span-3">
            <h3 className="text-lg font-bold mb-4 text-white relative inline-block">
              Liên hệ
              <span className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center text-gray-300 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mr-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <MailOutlined />
                </div>
                <span>dhlcinema@gmail.com</span>
              </li>
              <li className="flex items-center text-gray-300 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mr-3 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <PhoneOutlined />
                </div>
                <span>0344 632 293</span>
              </li>
              <li className="flex items-start text-gray-300 hover:text-white transition-colors group">
                <div className="w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center mr-3 mt-1 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                  <EnvironmentOutlined />
                </div>
                <span>31 Quốc Hương, P. Thảo Điền, TP. Thủ Đức, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 DHL Cinema. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-4 text-sm">
              <a href="/privacy-policy" className="text-gray-400 hover:text-primary transition-colors">Chính sách bảo mật</a>
              <a href="/terms-of-service" className="text-gray-400 hover:text-primary transition-colors">Điều khoản dịch vụ</a>
              <a href="/faq" className="text-gray-400 hover:text-primary transition-colors">FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;