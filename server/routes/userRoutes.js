const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, username, profile } = req.body;
    
    if (!email || !password || !username || !profile?.name) {
      return res.status(400).json({ 
        message: 'Email, password, username, and name are required.' 
      });
    }
    
    let userExists = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: userExists.email === email 
          ? 'Email already exists' 
          : 'Username already exists' 
      });
    }
    
    let user = new User({
      email,
      password, 
      username,
      profile
    });
    
    await user.save();
    
    user.lastLogin = Date.now();
    await user.save();
    
    const token = jwt.sign(
      { id: user._id, userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.profile.name
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    

    let isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    user.lastLogin = Date.now();
    await user.save();
    
    let token = jwt.sign(
      { id: user._id, userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        name: user.profile.name
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server Error' });
  }
});


router.post('/guest', async (req, res) => {
  try {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    

    const guestUsername = `guest-${timestamp}`;
    
    let guestUser = new User({
      email: `guest-${timestamp}@example.com`,
      password: `guest-${randomString}`, 
      username: guestUsername,
      profile: { 
        name: 'Guest User',
        isGuest: true
      }
    });
    
    await guestUser.save();
    
   
    guestUser.lastLogin = Date.now();
    await guestUser.save();
    
    
    let token = jwt.sign(
      { id: guestUser._id, userId: guestUser._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } 
    );
    
    res.json({ 
      token,
      user: {
        id: guestUser._id,
        email: guestUser.email,
        username: guestUser.username,
        name: guestUser.profile.name,
        isGuest: true
      }
    });
  } catch (err) {
    console.error("Guest login error:", err);
    res.status(500).json({ message: 'Failed to create guest user' });
  }
});

module.exports = router;