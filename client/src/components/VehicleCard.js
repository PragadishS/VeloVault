import React, { useState, useEffect } from 'react';
import ServiceHistory from './ServiceHistory';
import AddVehicle from './AddVehicle';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const VehicleCard = ({ vehicle, onDeleteVehicle, onUpdateVehicle }) => {
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [upcomingServiceDate, setUpcomingServiceDate] = useState(
    vehicle.upcomingServiceDate ? new Date(vehicle.upcomingServiceDate).toISOString().split('T')[0] : ""
  );
  const [isEditingServiceDate, setIsEditingServiceDate] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [showResaleValue, setShowResaleValue] = useState(false);
  const [resaleValue, setResaleValue] = useState(null);
  const [loading, setLoading] = useState({
    serviceHistory: false,
    updateService: false,
    resaleValue: false,
    deleteVehicle: false
  });
  const [error, setError] = useState("");
  const { token } = useAuth();

  
  useEffect(() => {
    if (showServiceHistory) {
      fetchServiceHistory();
    }
  }, [showServiceHistory]);

  
  useEffect(() => {
    if (vehicle.upcomingServiceDate) {
      setUpcomingServiceDate(new Date(vehicle.upcomingServiceDate).toISOString().split('T')[0]);
    } else {
      setUpcomingServiceDate("");
    }
    setIsEditingServiceDate(false);
  }, [vehicle]);

  
  const getLastServiceInfo = () => {
    if (vehicle.serviceHistory && vehicle.serviceHistory.length > 0) {
      
      const lastService = [...vehicle.serviceHistory].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      )[0];
      
      const lastServiceDate = new Date(lastService.date);
      const currentDate = new Date();
      const monthsDiff = Math.round(
        (currentDate - lastServiceDate) / (1000 * 60 * 60 * 24 * 30)
      );
      
      return `• It has been ${monthsDiff} months since last service. Consider scheduling a general check-up.`;
    } else {
      return "• No service history found. Consider scheduling a general check-up.";
    }
  };

  
  const fetchServiceHistory = async () => {
    setLoading({ ...loading, serviceHistory: true });
    setError("");
    
    try {
      const response = await axios.get(
        `http://localhost:3333/api/cars/${vehicle._id}/serviceHistory`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServiceHistory(response.data);
    } catch (error) {
      console.error("Error fetching service history:", error);
      setError("Failed to load service history");
    } finally {
      setLoading({ ...loading, serviceHistory: false });
    }
  };

 
  const handleAddService = async (carId, newService) => {
    try {
      await axios.post(
        `http://localhost:3333/api/cars/${carId}/serviceHistory`,
        newService,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchServiceHistory(); 
      return true;
    } catch (error) {
      console.error("Error adding service:", error);
      throw error; 
    }
  };

 
  const toggleEditServiceDate = () => {
    setIsEditingServiceDate(!isEditingServiceDate);
  };

  
  const handleUpdateUpcomingServiceDate = async () => {
    if (!isEditingServiceDate) {
      
      toggleEditServiceDate();
      return;
    }

    if (!upcomingServiceDate || new Date(upcomingServiceDate) <= new Date()) {
      alert("Please select a valid future date for the upcoming service.");
      return;
    }

    setLoading({ ...loading, updateService: true });

    try {
      await axios.post(
        `http://localhost:3333/api/cars/${vehicle._id}/upcomingServiceDate`,
        { upcomingServiceDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Upcoming service date updated!");
      setIsEditingServiceDate(false); 
    } catch (error) {
      console.error("Error updating upcoming service date:", error);
      alert("Failed to update service date. Please try again.");
    } finally {
      setLoading({ ...loading, updateService: false });
    }
  };

  
  const handleResaleValueClick = async () => {
    
    if (showResaleValue && resaleValue !== null) {
      setShowResaleValue(false);
      return;
    }
    
    setLoading({ ...loading, resaleValue: true });
    
    try {
      const response = await axios.get(
        `http://localhost:3333/api/cars/${vehicle._id}/resaleValue`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResaleValue(response.data.resaleValue);
      setShowResaleValue(true); 
    } catch (error) {
      console.error("Error fetching resale value:", error);
      alert("Failed to calculate resale value. Please try again.");
    } finally {
      setLoading({ ...loading, resaleValue: false });
    }
  };

  
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this vehicle? This action cannot be undone.")) {
      return;
    }
    
    setLoading({ ...loading, deleteVehicle: true });
    
    try {
      await onDeleteVehicle(vehicle._id);
    } catch (error) {
      console.error("Error deleting vehicle:", error);
    } finally {
      setLoading({ ...loading, deleteVehicle: false });
    }
  };


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="vehicle-card">
      <div className="card-header">
        <h3>{vehicle.companyName} - {vehicle.carNumber}</h3>
      </div>
      
      <div className="card-content">
        <div className="vehicle-details">
          <p><strong>Distance:</strong> {vehicle.distanceCovered.toLocaleString()} km</p>
          <p><strong>Mileage:</strong> {vehicle.mileage} km/l</p>
          <p><strong>Year:</strong> {vehicle.yearOfPurchase}</p>
          <p><strong>Price:</strong> {formatCurrency(vehicle.price)}</p>
          
          <div className="owner-section">
            <p><strong>Owner:</strong> {vehicle.owner.name}</p>
            
            <button 
              onClick={() => setShowContactInfo(!showContactInfo)} 
              className="contact-button"
            >
              {showContactInfo ? "Hide Contact" : "Contact Owner"}
            </button>

            {showContactInfo && (
              <div className="contact-info">
                <p><strong>Email:</strong> {vehicle.owner.email}</p>
                <p><strong>Phone:</strong> {vehicle.owner.phoneNumber}</p>
              </div>
            )}
          </div>
          
          <p className="lifespan"><strong>Lifespan:</strong> Healthy condition, approximately 15 years remaining</p>
          
          <div className="recommendations">
            <h4>Maintenance Recommendations:</h4>
            <p>{getLastServiceInfo()}</p>
          </div>
          
          {}
          {showResaleValue && resaleValue !== null && (
            <div className="resale-value">
              <h4>Estimated Resale Value:</h4>
              <p className="value">{formatCurrency(resaleValue)}</p>
            </div>
          )}
        </div>
        
        {}
        <div className={`service-date-section ${isEditingServiceDate ? 'editing' : ''}`}>
          <label>
            Upcoming Service Date:
            <input
              type="date"
              value={upcomingServiceDate}
              onChange={(e) => isEditingServiceDate && setUpcomingServiceDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              disabled={loading.updateService}
            />
          </label>
          <button 
            onClick={handleUpdateUpcomingServiceDate}
            className="update-date-button"
            disabled={loading.updateService}
          >
            {loading.updateService 
              ? "Updating..." 
              : isEditingServiceDate 
                ? "Save Service Date" 
                : "Update Service Date"}
          </button>
        </div>
      </div>
      
      {}
      <div className="card-buttons">
        <button 
          onClick={() => setShowUpdateForm(true)}
          className="update-button"
        >
          Update
        </button>
        
        <button 
          onClick={handleDelete}
          className="delete-button"
          disabled={loading.deleteVehicle}
        >
          {loading.deleteVehicle ? "Deleting..." : "Delete"}
        </button>
        
        <button 
          onClick={() => setShowServiceHistory(!showServiceHistory)}
          className="service-button"
        >
          {showServiceHistory ? "Hide Service History" : "Show Service History"}
        </button>
        
        <button 
          onClick={handleResaleValueClick}
          className="resale-button"
          disabled={loading.resaleValue}
        >
          {loading.resaleValue 
            ? "Calculating..." 
            : showResaleValue 
              ? "Hide Resale Value" 
              : "Get Resale Value"}
        </button>
      </div>
      
      {}
      {error && <div className="card-error">{error}</div>}
      
      {}
      {showServiceHistory && (
        <ServiceHistory
          serviceHistory={serviceHistory}
          onAddService={handleAddService}
          carId={vehicle._id}
        />
      )}

      {}
      {showUpdateForm && (
        <AddVehicle
          vehicleToUpdate={vehicle}
          onAddVehicle={onUpdateVehicle}
          onUpdateCancel={() => setShowUpdateForm(false)}
        />
      )}
    </div>
  );
};

export default VehicleCard;