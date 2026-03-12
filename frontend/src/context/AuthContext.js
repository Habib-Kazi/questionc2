import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const themes = {
  dark: {
    bg: "#0e0e18",
    nav: "#0a0a0f",
    border: "rgba(196,164,96,0.15)",
    text: "#e8e4dc",
    textMuted: "rgba(232,228,220,0.4)",
    accent: "#c4a460",
    accentText: "#0a0a0f",
    cardBg: "rgba(255,255,255,0.02)",
    input: "rgba(255,255,255,0.05)",
    inputBorder: "rgba(196,164,96,0.2)",
  },
  light: {
  bg: "#f0d4d1",
nav: "#fdf6f5",
    border: "rgba(196,164,96,0.3)",
    text: "#1a1a2e",
    textMuted: "rgba(26,26,46,0.5)",
    accent: "#a07830",
    accentText: "#ffffff",
    cardBg: "#ffffff",
    input: "#ffffff",
    inputBorder: "rgba(160,120,48,0.3)",
  },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const toggleTheme = () => {
    const newTheme = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const theme = themes[themeMode];

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, theme, themeMode, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
