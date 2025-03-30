import React, { useState, useEffect } from "react";

const AddVehicle = ({ onAddVehicle, vehicleToUpdate, onUpdateCancel }) => {
  
  const [vehicle, setVehicle] = useState({
    companyName: "",
    distanceCovered: "",
    mileage: "",
    serviceDates: [],
    owner: { name: "", email: "", phoneNumber: "" },
    carNumber: "",
    yearOfPurchase: new Date().getFullYear(),
    price: "",
    serviceHistory: [],
    upcomingServiceDate: ""
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  useEffect(() => {
    if (vehicleToUpdate) {
      
      const formattedVehicle = {
        ...vehicleToUpdate,
        
        upcomingServiceDate: vehicleToUpdate.upcomingServiceDate 
          ? new Date(vehicleToUpdate.upcomingServiceDate).toISOString().split('T')[0] 
          : ""
      };
      setVehicle(formattedVehicle);
    }
  }, [vehicleToUpdate]);

  const validateForm = () => {
    const errors = {};
    
    
    if (!vehicle.companyName.trim()) errors.companyName = "Company name is required";
    if (!vehicle.distanceCovered) errors.distanceCovered = "Distance is required";
    if (!vehicle.mileage) errors.mileage = "Mileage is required";
    if (!vehicle.carNumber.trim()) errors.carNumber = "Car number is required";
    if (!vehicle.yearOfPurchase) errors.yearOfPurchase = "Year of purchase is required";
    if (!vehicle.price) errors.price = "Price is required";
    
    
    if (!vehicle.owner.name.trim()) errors["owner.name"] = "Owner name is required";
    if (!vehicle.owner.email.trim()) errors["owner.email"] = "Owner email is required";
    if (!vehicle.owner.phoneNumber.trim()) errors["owner.phoneNumber"] = "Owner phone is required";
    
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (vehicle.owner.email && !emailRegex.test(vehicle.owner.email)) {
      errors["owner.email"] = "Invalid email format";
    }
    
    
    if (!vehicleToUpdate && vehicle.upcomingServiceDate && new Date(vehicle.upcomingServiceDate) <= new Date()) {
      errors.upcomingServiceDate = "Upcoming service date must be in the future";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith("owner.")) {
      const field = name.split(".")[1];
      setVehicle({
        ...vehicle,
        owner: {
          ...vehicle.owner,
          [field]: value
        }
      });
    } else {
      setVehicle({ ...vehicle, [name]: value });
    }
    
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    
    const formattedVehicle = {
      ...vehicle,
      distanceCovered: Number(vehicle.distanceCovered),
      mileage: Number(vehicle.mileage),
      yearOfPurchase: Number(vehicle.yearOfPurchase),
      price: Number(vehicle.price)
    };
    

    if (vehicleToUpdate) {
      
      if (formattedVehicle.upcomingServiceDate === "" || 
          formattedVehicle.upcomingServiceDate === "dd/mm/yyyy") {
        delete formattedVehicle.upcomingServiceDate;
      } else if (formattedVehicle.upcomingServiceDate) {
        
        formattedVehicle.upcomingServiceDate = new Date(formattedVehicle.upcomingServiceDate);
      }
    } else {
     
      formattedVehicle.upcomingServiceDate = vehicle.upcomingServiceDate ? 
        new Date(vehicle.upcomingServiceDate) : null;
    }
    
    try {
      await onAddVehicle(formattedVehicle);
      
      if (vehicleToUpdate) {
        onUpdateCancel(); 
      } else {
        
        setVehicle({
          companyName: "",
          distanceCovered: "",
          mileage: "",
          serviceDates: [],
          owner: { name: "", email: "", phoneNumber: "" },
          carNumber: "",
          yearOfPurchase: new Date().getFullYear(),
          price: "",
          serviceHistory: [],
          upcomingServiceDate: ""
        });
        setFormErrors({});
      }
    } catch (error) {
      console.error("Error submitting vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="form-container">
      <h2>{vehicleToUpdate ? "Update Vehicle" : "Add New Vehicle"}</h2>
      <form onSubmit={handleSubmit}>
        {}
        <div className="form-section">
          <h3>Vehicle Details</h3>
          
          <label>
            Company Name:
            <input
              type="text"
              name="companyName"
              value={vehicle.companyName}
              onChange={handleChange}
              className={formErrors.companyName ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.companyName && <div className="error-message">{formErrors.companyName}</div>}
          </label>
          
          <label>
            Distance Covered (km):
            <input
              type="number"
              name="distanceCovered"
              value={vehicle.distanceCovered}
              onChange={handleChange}
              min="0"
              className={formErrors.distanceCovered ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.distanceCovered && <div className="error-message">{formErrors.distanceCovered}</div>}
          </label>
          
          <label>
            Mileage (km/l):
            <input
              type="number"
              name="mileage"
              value={vehicle.mileage}
              onChange={handleChange}
              min="0"
              step="0.1"
              className={formErrors.mileage ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.mileage && <div className="error-message">{formErrors.mileage}</div>}
          </label>
          
          <label>
            Car Number:
            <input
              type="text"
              name="carNumber"
              value={vehicle.carNumber}
              onChange={handleChange}
              placeholder="e.g., KA-14-Z-1231"
              className={formErrors.carNumber ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.carNumber && <div className="error-message">{formErrors.carNumber}</div>}
          </label>
          
          <label>
            Year of Purchase:
            <input
              type="number"
              name="yearOfPurchase"
              value={vehicle.yearOfPurchase}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              className={formErrors.yearOfPurchase ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.yearOfPurchase && <div className="error-message">{formErrors.yearOfPurchase}</div>}
          </label>
          
          <label>
            Price (₹):
            <input
              type="number"
              name="price"
              value={vehicle.price}
              onChange={handleChange}
              min="0"
              className={formErrors.price ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors.price && <div className="error-message">{formErrors.price}</div>}
          </label>
          
          {}
          {!vehicleToUpdate && (
            <label>
              Upcoming Service Date:
              <input 
                type="date" 
                name="upcomingServiceDate" 
                value={vehicle.upcomingServiceDate} 
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className={formErrors.upcomingServiceDate ? "error" : ""}
                disabled={isSubmitting}
              />
              {formErrors.upcomingServiceDate && <div className="error-message">{formErrors.upcomingServiceDate}</div>}
            </label>
          )}
        </div>

        {}
        <div className="form-section">
          <h3>Owner Details</h3>
          
          <label>
            Owner Name:
            <input
              type="text"
              name="owner.name"
              value={vehicle.owner.name}
              onChange={handleChange}
              className={formErrors["owner.name"] ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors["owner.name"] && <div className="error-message">{formErrors["owner.name"]}</div>}
          </label>
          
          <label>
            Owner Email:
            <input
              type="email"
              name="owner.email"
              value={vehicle.owner.email}
              onChange={handleChange}
              className={formErrors["owner.email"] ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors["owner.email"] && <div className="error-message">{formErrors["owner.email"]}</div>}
          </label>
          
          <label>
            Owner Phone Number:
            <input
              type="text"
              name="owner.phoneNumber"
              value={vehicle.owner.phoneNumber}
              onChange={handleChange}
              placeholder="e.g., 9876543210"
              className={formErrors["owner.phoneNumber"] ? "error" : ""}
              disabled={isSubmitting}
            />
            {formErrors["owner.phoneNumber"] && <div className="error-message">{formErrors["owner.phoneNumber"]}</div>}
          </label>
        </div>

        {}
        <div className="form-buttons">
          <button 
            type="submit" 
            className="form-button primary"
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (vehicleToUpdate ? "Saving..." : "Adding...") 
              : (vehicleToUpdate ? "Save Changes" : "Add Vehicle")}
          </button>
          
          {vehicleToUpdate && (
            <button 
              type="button" 
              className="form-button secondary"
              onClick={onUpdateCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddVehicle;