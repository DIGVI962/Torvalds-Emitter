const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    // required: true
  },
  picture: String,
  emailVerified: Boolean,
  lastLogin: Date,
  metadata: {
    preferences: {
      language: String,
      notifications: Boolean
    },
    deviceInfo: {
      lastDevice: String,
      lastIP: String
    },
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('users', userSchema);
