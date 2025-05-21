// LoadingSpinner.jsx
import React from "react";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";

const LoadingSpinner = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div
        className={`w-12 h-12 border-4 rounded-full animate-spin ${
          theme === "dark"
            ? "border-red-400 border-t-transparent"
            : "border-red-500 border-t-transparent"
        }`}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
