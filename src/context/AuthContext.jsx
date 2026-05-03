import React, { createContext, useContext, useState } from "react";

// 1. Create the context (like a global storage box)
const AuthContext = createContext();

// 2. Create the Provider (wraps the whole app, gives access to the box)
export const AuthProvider = ({ children }) => {
  // Try to load user from localStorage (so login persists on refresh)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("chatUser");
    return saved ? JSON.parse(saved) : null;
  });

  // Call this when user logs in
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("chatUser", JSON.stringify(userData));
  };

  // Call this when user logs out
  const logout = () => {
    setUser(null);
    localStorage.removeItem("chatUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Custom hook to easily use auth anywhere
// Instead of: useContext(AuthContext)
// You can write: useAuth()
export const useAuth = () => useContext(AuthContext);
