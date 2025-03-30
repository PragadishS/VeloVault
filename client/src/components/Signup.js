import React, { useState } from "react";
import axios from "axios";

const Signup = ({ onSignupSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    name: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    const { email, username, password, confirmPassword, name } = formData;
    
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }
    
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    
    try {
      await axios.post("https://velovault-api.onrender.com/api/users/signup", {
        email,
        password,
        username,
        profile: { name }
      });
      
      setSuccessMessage("Signup successful! You can now log in.");
      setFormData({
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        name: ""
      });
      
      
      if (onSignupSuccess) {
        setTimeout(() => {
          onSignupSuccess();
        }, 1500);
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(
        err.response?.data?.message || 
        "Signup failed. Please check the information and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Create an Account</h2>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
      
      <form onSubmit={handleSubmit}>
        <label>
          Email:
          <input 
            type="email" 
            name="email"
            value={formData.email} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </label>
        
        <label>
          Username:
          <input 
            type="text" 
            name="username"
            value={formData.username} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </label>
        
        <label>
          Full Name:
          <input 
            type="text" 
            name="name"
            value={formData.name} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </label>
        
        <label>
          Password:
          <input 
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </label>
        
        <label>
          Confirm Password:
          <input 
            type="password" 
            name="confirmPassword"
            value={formData.confirmPassword} 
            onChange={handleChange} 
            required 
            disabled={loading}
          />
        </label>
        
        <button 
          type="submit" 
          className="form-button"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Create Account"}
        </button>
      </form>
    </div>
  );
};

export default Signup;