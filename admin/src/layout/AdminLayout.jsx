// src/layout/AdminLayout.jsx
import { useState, useEffect } from 'react';
import { useStore } from 'react-admin';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

// Hàm này thay thế cho Layout của React Admin
const AdminLayout = ({ children }) => {
  // Lấy thông tin sidebar state từ store của React Admin (nếu cần)
  const [open, setOpen] = useStore('sidebar.open', true);
  
  // State cho dark mode
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    // Áp dụng theme cho body
    const theme = darkMode ? 'dark' : 'light';
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [darkMode]);

  // Hàm toggle sidebar
  const toggleSidebar = () => {
    setOpen(!open);
  };

  // Hàm toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        open={open} 
        darkMode={darkMode} 
      />

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <Header 
          toggleSidebar={toggleSidebar} 
          sidebarOpen={open} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        {/* Page Content */}
        <main 
          className={`flex-1 overflow-auto p-6 transition-colors duration-300 ${
            darkMode ? 'bg-background-dark text-text-primary-dark' : 'bg-background-light text-text-primary'
          }`}
        >
          {children}
        </main>

        {/* Footer */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

export default AdminLayout;