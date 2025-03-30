const express = require('express');
const Car = require('../models/Car');
const router = express.Router();

// Get all cars for a user
router.get('/', async (req, res) => {
  try {
    const cars = await Car.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    res.status(500).json({ message: 'Error fetching cars' });
  }
});

// Get a specific car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    res.json(car);
  } catch (error) {
    console.error('Error fetching car details:', error);
    res.status(500).json({ message: 'Error fetching car details' });
  }
});

// Add a new car
router.post('/', async (req, res) => {
  try {
    const carData = req.body;
    
    // Handle numeric conversions if needed
    if (typeof carData.distanceCovered === 'string') {
      carData.distanceCovered = parseFloat(carData.distanceCovered);
    }
    if (typeof carData.mileage === 'string') {
      carData.mileage = parseFloat(carData.mileage);
    }
    if (typeof carData.yearOfPurchase === 'string') {
      carData.yearOfPurchase = parseInt(carData.yearOfPurchase, 10);
    }
    if (typeof carData.price === 'string') {
      carData.price = parseFloat(carData.price);
    }
    
    const newCar = new Car({
      ...carData,
      userId: req.user.id
    });
    
    await newCar.save();
    res.status(201).json(newCar);
  } catch (error) {
    console.error('Error adding car:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ message: 'Error adding car' });
  }
});

// Update a car
router.put('/:id', async (req, res) => {
  try {
    // First find the car to verify ownership
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if the car belongs to the current user
    if (car.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this car' });
    }
    
    // Handle numeric conversions if needed
    const updatedData = { ...req.body };
    if (typeof updatedData.distanceCovered === 'string') {
      updatedData.distanceCovered = parseFloat(updatedData.distanceCovered);
    }
    if (typeof updatedData.mileage === 'string') {
      updatedData.mileage = parseFloat(updatedData.mileage);
    }
    if (typeof updatedData.yearOfPurchase === 'string') {
      updatedData.yearOfPurchase = parseInt(updatedData.yearOfPurchase, 10);
    }
    if (typeof updatedData.price === 'string') {
      updatedData.price = parseFloat(updatedData.price);
    }
    
    // Now update the car
    const updatedCar = await Car.findByIdAndUpdate(
      req.params.id, 
      { ...updatedData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.json(updatedCar);
  } catch (error) {
    console.error('Error updating car:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = {};
      for (const field in error.errors) {
        validationErrors[field] = error.errors[field].message;
      }
      return res.status(400).json({ 
        message: 'Validation error',
        errors: validationErrors
      });
    }
    
    res.status(500).json({ message: 'Error updating car' });
  }
});

// Delete a car
router.delete('/:id', async (req, res) => {
  try {
    // First find the car to verify ownership
    const car = await Car.findById(req.params.id);
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }
    
    // Check if the car belongs to the current user
    if (car.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this car' });
    }
    
    // Now delete the car
    await Car.findByIdAndDelete(req.params.id);
    res.json({ message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error deleting car:', error);
    res.status(500).json({ message: 'Error deleting car' });
  }
});

// Search route - IMPORTANT: This must be BEFORE the /:id route or it will never be reached
router.get('/search', async (req, res) => {
  try {
    const { query, searchBy } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' });
    }
    
    let searchCriteria = { userId: req.user.id };
    
    if (searchBy === 'owner') {
      searchCriteria['owner.name'] = { $regex: query, $options: 'i' };
    } else if (searchBy === 'carNumber') {
      searchCriteria.carNumber = { $regex: query, $options: 'i' };
    } else if (searchBy === 'company') {
      searchCriteria.companyName = { $regex: query, $options: 'i' };
    } else {
      // Default search across multiple fields
      searchCriteria.$or = [
        { 'owner.name': { $regex: query, $options: 'i' } },
        { carNumber: { $regex: query, $options: 'i' } },
        { companyName: { $regex: query, $options: 'i' } }
      ];
    }
    
    const cars = await Car.find(searchCriteria);
    res.json(cars);
  } catch (error) {
    console.error('Error searching cars:', error);
    res.status(500).json({ message: 'Error searching cars' });
  }
});

module.exports = router;