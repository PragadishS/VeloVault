import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";

const ProfileButton = ({ userInfo, onLogout, onProfileUpdate }) => {
  const { token } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    username: ""
  });
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setUserName(userInfo.name || userInfo.username || "User");
      setIsGuest(userInfo.isGuest || false);
      
      setEditForm({
        name: userInfo.name || "",
        email: userInfo.email || "",
        username: userInfo.username || ""
      });
    }
  }, [userInfo]);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    setIsEditing(false); 
    setError("");
    setSuccess("");
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    
    if (userInfo) {
      setEditForm({
        name: userInfo.name || "",
        email: userInfo.email || "",
        username: userInfo.username || ""
      });
    }
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

   
    const updateData = {};
    if (editForm.name !== userInfo.name) updateData.name = editForm.name;
    if (editForm.email !== userInfo.email) updateData.email = editForm.email;
    if (editForm.username !== userInfo.username) updateData.username = editForm.username;

    
    if (Object.keys(updateData).length === 0) {
      setError("No changes to save");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:3333/api/users/profile",
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess("Profile updated successfully");
      
      
      setUserName(editForm.name || userName);
      
      
      if (onProfileUpdate && response.data.user) {
        onProfileUpdate(response.data.user);
      }
      
      
      setTimeout(() => {
        setIsEditing(false);
        setSuccess("");
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleClickOutside = (e) => {
    
    if (showProfileMenu && e.target.closest('.profile-menu') === null && e.target.closest('.profile-button') === null) {
      setShowProfileMenu(false);
      setIsEditing(false);
    }
  };

  
  useEffect(() => {
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  return (
    <div className="profile-container">
      <button 
        className="profile-button"
        onClick={toggleProfileMenu}
        aria-label="Profile"
      >
        {getInitials(userName)}
      </button>

      {showProfileMenu && (
        <div className="profile-menu">
          <h3>My Profile</h3>
          
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {!isEditing ? (
            <>
              <p><strong>Name:</strong> {userInfo?.name || "Not set"}</p>
              <p><strong>Email:</strong> {userInfo?.email}</p>
              <p><strong>Username:</strong> {userInfo?.username}</p>
              
              {isGuest ? (
                <p><em>You are using a guest account</em></p>
              ) : (
                <div className="profile-actions">
                  <button 
                    className="edit-profile-button"
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </button>
                </div>
              )}
              
              <button 
                onClick={() => {
                  onLogout();
                  setShowProfileMenu(false);
                }}
                className="logout-button"
              >
                Logout
              </button>
            </>
          ) : (
            <form className="edit-profile-form" onSubmit={handleSubmit}>
              <label>
                Name:
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleChange}
                  placeholder="Your name"
                />
              </label>
              
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={editForm.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </label>
              
              <label>
                Username:
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleChange}
                  placeholder="username"
                />
              </label>
              
              <div className="edit-buttons">
                <button type="submit" className="form-button primary">
                  Save Changes
                </button>
                <button 
                  type="button" 
                  className="form-button secondary"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileButton;