import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("token");
      setIsAuthenticated(false);
      setUserId(null);
    }
  }, [token]);

  const login = (newToken, uid = null) => {
    setToken(newToken);
    setIsAuthenticated(true);
    if (uid) setUserId(uid);
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    setUserId(null);
    localStorage.removeItem("token");
  };

  const contextValue = {
    token,
    isAuthenticated,
    userId,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);