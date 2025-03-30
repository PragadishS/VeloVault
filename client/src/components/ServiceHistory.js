import React, { useState } from "react";

const ServiceHistory = ({ serviceHistory, onAddService, carId }) => {
  const [newService, setNewService] = useState({
    date: "",
    cost: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewService({ ...newService, [name]: value });
    
    
    if (error) {
      setError("");
    }
  };

  const validateForm = () => {
    if (!newService.date) {
      setError("Please select a service date");
      return false;
    }
    
    if (!newService.cost || isNaN(newService.cost) || Number(newService.cost) <= 0) {
      setError("Please enter a valid cost amount");
      return false;
    }
    
    if (!newService.description.trim()) {
      setError("Please enter a service description");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      
      const formattedService = {
        date: newService.date,
        cost: Number(newService.cost),
        description: newService.description.trim()
      };
      
      await onAddService(carId, formattedService);
      
      
      setNewService({ date: "", cost: "", description: "" });
      setError("");
    } catch (err) {
      setError("Failed to add service record. Please try again.");
      console.error("Error adding service:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="service-history-container">
      <h2>Service History</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {serviceHistory && serviceHistory.length > 0 ? (
        <div className="service-table-container">
          <table className="service-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Cost (₹)</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {serviceHistory.map((service, index) => (
                <tr key={index}>
                  <td>{formatDate(service.date)}</td>
                  <td>{service.cost.toLocaleString()}</td>
                  <td>{service.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="no-service-history">No service history available. Add your first service record below.</p>
      )}

      <div className="add-service-section">
        <h3>Add New Service Record</h3>
        <form onSubmit={handleSubmit} className="add-service-form">
          <div className="form-row">
            <label>
              Date:
              <input
                type="date"
                name="date"
                value={newService.date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} 
                disabled={isSubmitting}
                required
              />
            </label>
            
            <label>
              Cost (₹):
              <input
                type="number"
                name="cost"
                value={newService.cost}
                onChange={handleChange}
                min="1"
                step="1"
                disabled={isSubmitting}
                required
              />
            </label>
          </div>
          
          <label>
            Description:
            <input
              type="text"
              name="description"
              value={newService.description}
              onChange={handleChange}
              placeholder="e.g., Oil change, Brake service, etc."
              disabled={isSubmitting}
              required
            />
          </label>
          
          <button 
            type="submit" 
            className="add-service-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Service"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceHistory;