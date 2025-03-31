import React, { useState } from "react";
import { useAuth } from "../AuthContext";
import axios from "axios";

const Navbar = ({ onLogout, userInfo, allVehicles, onSearchResults }) => {
  const { token } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBy, setSearchBy] = useState("owner");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      
      onSearchResults(allVehicles);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await axios.get(
        "https://velovault-api.onrender.com/api/cars/search",
        { 
          params: {
            query: searchQuery,
            searchBy: searchBy
          },
          headers: { Authorization: `Bearer ${token}` } 
        }
      );

      
      onSearchResults(response.data);
      
      
      if (response.data.length > 0) {
        
       
      } else {
        alert('No results found');
      }
    } catch (error) {
      console.error("Error searching cars:", error);
      setSearchError(
        error.response?.data?.message || "Error searching. Please try again."
      );
    } finally {
      setIsSearching(false);
    }
  };

  
  const handleClearSearch = () => {
    setSearchQuery("");
    onSearchResults(allVehicles);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <nav className="navbar">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search cars by owner, car number or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isSearching}
        />
        
        <select 
          value={searchBy} 
          onChange={(e) => setSearchBy(e.target.value)}
          className="search-select"
          disabled={isSearching}
        >
          <option value="owner">Owner Name</option>
          <option value="carNumber">Car Number</option>
          <option value="company">Company</option>
        </select>
        
        <button 
          onClick={handleSearch}
          className="search-button"
          disabled={isSearching}
        >
          {isSearching ? "Searching..." : "Search"}
        </button>
        
        {searchQuery && (
          <button 
            onClick={handleClearSearch}
            className="clear-search-button"
          >
            Clear
          </button>
        )}
      </div>

      {searchError && (
        <div className="search-error">
          {searchError}
        </div>
      )}
    </nav>
  );
};

export default Navbar;