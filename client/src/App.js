import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import AddVehicle from "./components/AddVehicle";
import VehicleList from "./components/VehicleList";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import ProfileButton from "./components/ProfileButton";

function AppContent() {
  const { token, isAuthenticated, login, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  const fetchUserInfo = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await axios.get("https://velovault-api.onrender.com/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserInfo(response.data);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, [token]);

  const fetchVehicles = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get("https://velovault-api.onrender.com/api/cars", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data);
      setFilteredVehicles(response.data); 
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error fetching vehicles: " + (error.response?.data?.message || "Please try again."));
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    document.title = "VeloVault - Car Management System";
    
    if (isAuthenticated && token) {
      fetchVehicles();
      fetchUserInfo();
    }
  }, [isAuthenticated, token, fetchVehicles, fetchUserInfo]);
  
  useEffect(() => {
    const handleSearchResults = (event) => {
      if (event.detail && Array.isArray(event.detail)) {
        setFilteredVehicles(event.detail);
      }
    };

    window.addEventListener('searchResults', handleSearchResults);

    return () => {
      window.removeEventListener('searchResults', handleSearchResults);
    };
  }, []);

  const handleAddVehicle = async (vehicle) => {
    if (!token) return;
    
    try {
      if (vehicle._id) {
        await axios.put(`https://velovault-api.onrender.com/api/cars/${vehicle._id}`, vehicle, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("https://velovault-api.onrender.com/api/cars", vehicle, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchVehicles();
      setShowAddForm(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error adding/updating vehicle: " + (error.response?.data?.message || "Please try again."));
      console.error("Error adding/updating vehicle:", error);
    }
  };

  const handleDeleteVehicle = async (id) => {
    if (!token) return;
    
    try {
      await axios.delete(`https://velovault-api.onrender.com/api/cars/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVehicles();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error deleting vehicle: " + (error.response?.data?.message || "Please try again."));
      console.error("Error deleting vehicle:", error);
    }
  };

  const handleUpdateVehicle = async (updatedVehicle) => {
    await handleAddVehicle(updatedVehicle);
  };

  const handleLoginSuccess = (token, userData) => {
    login(token);
    if (userData) {
      setUserInfo(userData);
    }
    setShowLogin(false);
    setShowSignup(false);
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      const response = await axios.post("https://velovault-api.onrender.com/api/users/guest");
      if (response.data && response.data.token) {
        login(response.data.token);
        if (response.data.user) {
          setUserInfo({
            ...response.data.user,
            isGuest: true
          });
        }
        setErrorMessage("");
      } else {
        setErrorMessage("Invalid response from server when logging in as guest.");
      }
    } catch (err) {
      setErrorMessage("Unable to log in as a guest: " + (err.response?.data?.message || "Please try again."));
      console.error("Guest login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setVehicles([]);
    setFilteredVehicles([]);
    setUserInfo(null);
  };

  const handleProfileUpdate = (updatedUser) => {
    if (updatedUser) {
      setUserInfo(prev => ({
        ...prev,
        ...updatedUser
      }));
    }
    fetchUserInfo(); 
  };

  return (
    <div className="App">
      {isAuthenticated && userInfo && (
        <ProfileButton 
          onLogout={handleLogout} 
          userInfo={userInfo}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
      
      <div className="app-header">
        <h1>VeloVault</h1>
        
        <div className="auth-buttons">
          {!isAuthenticated ? (
            <>
              <button onClick={() => { setShowLogin(true); setShowSignup(false); }}>Login</button>
              <button onClick={() => { setShowSignup(true); setShowLogin(false); }}>Signup</button>
              <button onClick={handleGuestLogin} disabled={loading}>
                {loading ? "Loading..." : "Guest User"}
              </button>
            </>
          ) : null}
        </div>
      </div>

      {errorMessage && (
        <div className="error-message" style={{ textAlign: "center", padding: "10px", backgroundColor: "rgba(136, 0, 0, 0.7)", margin: "10px auto", maxWidth: "800px", borderRadius: "4px", color: "white" }}>
          <p>{errorMessage}</p>
          <button onClick={() => setErrorMessage("")} style={{ padding: "5px", cursor: "pointer", marginTop: "5px", backgroundColor: "rgba(0, 0, 0, 0.3)" }}>Dismiss</button>
        </div>
      )}
      
      {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}
      {showSignup && <Signup onSignupSuccess={() => setShowLogin(true)} />}
      
      {isAuthenticated && (
        <>
          <div className="navbar-container">
            <Navbar 
              onLogout={handleLogout} 
              userInfo={userInfo}
              allVehicles={vehicles}
              onSearchResults={setFilteredVehicles}
            />
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="add-vehicle-button"
            >
              {showAddForm ? "Hide Form" : "Add Vehicle"}
            </button>
          </div>
          
          {showAddForm && (
            <AddVehicle
              onAddVehicle={handleAddVehicle}
              onUpdateCancel={() => setShowAddForm(false)}
            />
          )}

          <VehicleList
            vehicles={filteredVehicles}
            onDeleteVehicle={handleDeleteVehicle}
            onUpdateVehicle={handleUpdateVehicle}
            loading={loading}
          />
        </>
      )}
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;