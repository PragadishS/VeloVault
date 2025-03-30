import React, { useState, useEffect } from "react";
import VehicleCard from "./VehicleCard";

const VehicleList = ({ vehicles, onDeleteVehicle, onUpdateVehicle, loading }) => {
  const [sortBy, setSortBy] = useState("newest");
  const [sortedVehicles, setSortedVehicles] = useState([]);

 
  useEffect(() => {
    const sortVehicles = () => {
      if (!vehicles || vehicles.length === 0) {
        setSortedVehicles([]);
        return;
      }
      
      const sorted = [...vehicles];
      
      switch (sortBy) {
        case "newest":
          sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
        case "oldest":
          sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
          break;
        case "price-high":
          sorted.sort((a, b) => b.price - a.price);
          break;
        case "price-low":
          sorted.sort((a, b) => a.price - b.price);
          break;
        case "year-new":
          sorted.sort((a, b) => b.yearOfPurchase - a.yearOfPurchase);
          break;
        case "year-old":
          sorted.sort((a, b) => a.yearOfPurchase - b.yearOfPurchase);
          break;
        default:
          break;
      }
      
      setSortedVehicles(sorted);
    };
    
    sortVehicles();
  }, [vehicles, sortBy]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  return (
    <div className="list">
      <h2>Vehicle List</h2>
      
      {}
      <div className="filter-sort-controls">
        <div className="sort-control">
          <label>
            Sort by:
            <select value={sortBy} onChange={handleSortChange}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
              <option value="year-new">Year: Newest First</option>
              <option value="year-old">Year: Oldest First</option>
            </select>
          </label>
        </div>
      </div>
      
      {}
      <div className="list-container">
        {sortedVehicles.length > 0 ? (
          sortedVehicles.map(vehicle => (
            <VehicleCard
              key={vehicle._id}
              vehicle={vehicle}
              onDeleteVehicle={onDeleteVehicle}
              onUpdateVehicle={onUpdateVehicle}
            />
          ))
        ) : (
          <p className="no-vehicles-message">
            {loading ? "Loading vehicles..." : 
             (vehicles.length === 0 ? "No vehicles found. Add your first vehicle!" : "No matching vehicles found.")}
          </p>
        )}
      </div>
    </div>
  );
};

export default VehicleList;