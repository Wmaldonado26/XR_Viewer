import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  const [isLightMode, setIsLightMode] = useState(true);

  useEffect(() => {
    if (isLightMode) {
      document.body.classList.add("light-theme");
      document.body.classList.remove("dark-mode");
    } else {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-theme");
    }
  }, [isLightMode]);

  const toggleLightMode = () => setIsLightMode(!isLightMode);

  return (
    <ThemeContext.Provider value={{ isLightMode, toggleLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
