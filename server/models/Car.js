const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  cost: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const carSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  distanceCovered: { type: Number, required: true },
  mileage: { type: Number, required: true },
  serviceDates: [{ type: Date }],
  owner: {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
  },
  carNumber: { type: String, required: true, trim: true, uppercase: true },
  yearOfPurchase: { type: Number, required: true },
  price: { type: Number, required: true },
  serviceHistory: [serviceSchema],
  upcomingServiceDate: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
carSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add index for faster queries
carSchema.index({ userId: 1 });
carSchema.index({ 'owner.name': 'text', carNumber: 'text' });

module.exports = mongoose.model('Car', carSchema);