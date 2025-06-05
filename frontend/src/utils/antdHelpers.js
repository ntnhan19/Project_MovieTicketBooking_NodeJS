// frontend/src/utils/antdHelpers.js
import { useState, useEffect } from 'react';
import { App } from 'antd';

// Hook để sử dụng Antd components với context
export const useAntdComponents = () => {
  const { message, modal, notification } = App.useApp();
  return { message, modal, notification };
};

// Responsive breakpoints theo Tailwind CSS
export const breakpoints = {
  xs: '480px',
  sm: '640px', 
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Hook để detect screen size
export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 768 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
};

// Responsive classes utility
export const getResponsiveClasses = (baseClasses, responsiveClasses = {}) => {
  const { isMobile, isTablet, isDesktop } = useResponsive();
  
  let classes = baseClasses;
  
  if (isMobile && responsiveClasses.mobile) {
    classes += ' ' + responsiveClasses.mobile;
  } else if (isTablet && responsiveClasses.tablet) {
    classes += ' ' + responsiveClasses.tablet;
  } else if (isDesktop && responsiveClasses.desktop) {
    classes += ' ' + responsiveClasses.desktop;
  }
  
  return classes;
};

// Antd theme configuration factory
export const createAntdTheme = (theme) => ({
  token: {
    colorPrimary: "#e71a0f",
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 12,
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
    colorText: theme === "dark" ? "#d1d5db" : "#333333",
    colorTextSecondary: theme === "dark" ? "#d1d5db" : "#666666",
    colorBorder: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
  },
  components: {
    Tabs: {
      itemSelectedColor: "#e71a0f",
      itemHoverColor: "#e71a0f", 
      inkBarColor: "#e71a0f",
      colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
      itemActiveColor: "#e71a0f",
      itemColor: theme === "dark" ? "#d1d5db" : "#666666",
      horizontalItemPadding: "12px 24px",
    },
    Input: {
      borderRadius: 12,
      colorBorder: theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
      colorBgContainer: theme === "dark" ? "#374151" : "#ffffff",
    },
    Button: {
      borderRadius: 12,
      colorPrimary: "#e71a0f",
      colorPrimaryHover: "#c41208",
    },
    Modal: {
      colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
      colorText: theme === "dark" ? "#d1d5db" : "#333333",
    },
    Card: {
      borderRadius: 12,
      colorBgContainer: theme === "dark" ? "#1f2a44" : "#ffffff",
    }
  },
});

// Mobile-first responsive grid utility
export const getGridClasses = (cols = { xs: 1, sm: 2, md: 3, lg: 4 }) => {
  return `grid grid-cols-${cols.xs} sm:grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg} gap-4`;
};

// Responsive container classes
export const containerClasses = "container mx-auto px-4 sm:px-6 lg:px-8";

// Common responsive spacing
export const responsiveSpacing = {
  padding: "p-4 sm:p-6 lg:p-8",
  margin: "m-4 sm:m-6 lg:m-8", 
  gap: "gap-4 sm:gap-6 lg:gap-8"
};