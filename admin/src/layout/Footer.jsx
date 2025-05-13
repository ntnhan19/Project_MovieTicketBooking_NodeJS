// admin/src/layout/Footer.jsx
import { Link } from 'react-router-dom';

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className={`shrink-0 border-t ${
        darkMode 
          ? 'bg-background-paper-dark text-gray-400 border-border-dark' 
          : 'bg-white text-gray-500 border-border-light'
      } py-3 px-6 flex flex-col md:flex-row justify-between items-center text-sm`}
    >
      <div>
        &copy; {currentYear} DHL Cinema Admin. All rights reserved.
      </div>
      <div className="mt-2 md:mt-0 flex space-x-4">
        <Link 
          to="/help"  
          className={`${
            darkMode ? 'hover:text-white' : 'hover:text-primary'
          } transition-colors duration-200`}
        >
          Trợ giúp
        </Link>
        <Link 
          to="/privacy-policy" 
          className={`${
            darkMode ? 'hover:text-white' : 'hover:text-primary'
          } transition-colors duration-200`}
        >
          Chính sách bảo mật
        </Link>
        <Link 
          to="/terms" 
          className={`${
            darkMode ? 'hover:text-white' : 'hover:text-primary'
          } transition-colors duration-200`}
        >
          Điều khoản
        </Link>
      </div>
    </footer>
  );
};

export default Footer;