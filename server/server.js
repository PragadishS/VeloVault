const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Import routes
const userRoutes = require('./routes/userroutes');
const carRoutes = require('./routes/carroutes');

// Import models
const User = require('./models/User');
const Car = require('./models/Car');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3333;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    
    // Set user ID in req object for use in routes
    req.user = { 
      id: decoded.id || decoded.userId,
      userId: decoded.id || decoded.userId
    };
    next();
  });
};

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Car Management API' });
});

// Get current user info
app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      id: user._id,
      email: user.email,
      username: user.username,
      name: user.profile.name,
      phone: user.profile.phone,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isGuest: user.profile.isGuest
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ message: 'Error fetching user information' });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if email is taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      user.email = email;
    }
    
    // Check if username is taken by another user
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username, _id: { $ne: user._id } });
      if (usernameExists) {
        return res.status(400).json({ message: 'Username is already in use' });
      }
      user.username = username;
    }
    
    // Update profile fields if provided
    if (name) {
      if (!user.profile) {
        user.profile = { name };
      } else {
        user.profile.name = name;
      }
    }
    
    // Handle password update separately
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.profile.name
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Use the user routes
app.use('/api/users', userRoutes);

// Car routes need to be reorganized because '/search' conflicts with '/:id'
// We'll handle the search route here before mounting the car routes
app.get('/api/cars/search', authenticateToken, async (req, res) => {
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

// Protected car routes - apply authentication
app.use('/api/cars', authenticateToken, carRoutes);

// Add service history routes
app.post('/api/cars/:id/serviceHistory', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    const { date, cost, description } = req.body;
    car.serviceHistory.push({ date, cost, description });
    await car.save();
    
    res.status(201).json(car.serviceHistory);
  } catch (error) {
    console.error('Error adding service history:', error);
    res.status(500).json({ message: 'Error adding service history' });
  }
});

app.get('/api/cars/:id/serviceHistory', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    res.json(car.serviceHistory);
  } catch (error) {
    console.error('Error fetching service history:', error);
    res.status(500).json({ message: 'Error fetching service history' });
  }
});

// Update upcoming service date
app.post('/api/cars/:id/upcomingServiceDate', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    car.upcomingServiceDate = req.body.upcomingServiceDate;
    await car.save();
    
    res.json({ message: 'Upcoming service date updated', upcomingServiceDate: car.upcomingServiceDate });
  } catch (error) {
    console.error('Error updating upcoming service date:', error);
    res.status(500).json({ message: 'Error updating upcoming service date' });
  }
});

// Calculate resale value
app.get('/api/cars/:id/resaleValue', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    // Simply calculate 50% of original price
    const resaleValue = Math.round(car.price * 0.5);
    
    res.json({ resaleValue });
  } catch (error) {
    console.error('Error calculating resale value:', error);
    res.status(500).json({ message: 'Error calculating resale value' });
  }
});

// Calculate estimated lifespan
app.get('/api/cars/:id/lifespan', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    const currentYear = new Date().getFullYear();
    const age = currentYear - car.yearOfPurchase;
    const averageLifespan = 15; // Average car lifespan in years
    const estimatedRemainingYears = Math.max(0, averageLifespan - age);
    
    // Format the response
    let lifespan;
    if (estimatedRemainingYears <= 0) {
      lifespan = "Your vehicle has exceeded its estimated lifespan";
    } else if (estimatedRemainingYears < 5) {
      lifespan = `Approximately ${estimatedRemainingYears} years remaining`;
    } else {
      lifespan = `Healthy condition, approximately ${estimatedRemainingYears} years remaining`;
    }
    
    res.json({ lifespan });
  } catch (error) {
    console.error('Error calculating lifespan:', error);
    res.status(500).json({ message: 'Error calculating lifespan' });
  }
});

// Get maintenance recommendations
app.get('/api/cars/:id/recommendations', authenticateToken, async (req, res) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
    
    if (!car) {
      return res.status(404).json({ message: 'Car not found or you do not have permission' });
    }
    
    // Basic maintenance recommendations based on distance covered
    const recommendations = [];
    
    if (car.distanceCovered > 5000) {
      recommendations.push("Oil and filter change recommended");
    }
    
    if (car.distanceCovered > 10000) {
      recommendations.push("Check and replace air filter if necessary");
    }
    
    if (car.distanceCovered > 30000) {
      recommendations.push("Inspect and potentially replace brake pads");
    }
    
    if (car.distanceCovered > 50000) {
      recommendations.push("Consider transmission fluid change");
    }
    
    if (car.distanceCovered > 80000) {
      recommendations.push("Inspect timing belt and consider replacement");
    }
    
    // Add recommendation based on last service date
    if (car.serviceHistory && car.serviceHistory.length > 0) {
      const lastService = new Date(car.serviceHistory[car.serviceHistory.length - 1].date);
      const monthsSinceLastService = (new Date() - lastService) / (1000 * 60 * 60 * 24 * 30);
      
      if (monthsSinceLastService > 6) {
        recommendations.push(`It has been ${Math.round(monthsSinceLastService)} months since last service. Consider scheduling a general check-up.`);
      }
    } else {
      recommendations.push("No service history found. Consider scheduling a general check-up.");
    }
    
    res.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ message: 'Error generating recommendations' });
  }
});

// Fallback for 404 errors
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // Export for testing