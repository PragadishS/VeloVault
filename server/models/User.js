const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  username: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },
  profile: {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    phone: { 
      type: String,
      trim: true
    },
    isGuest: {
      type: Boolean,
      default: false
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: { 
    type: Date, 
    default: null 
  }
});


userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = Date.now();
  return this.save();
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

module.exports = mongoose.model('User', userSchema);