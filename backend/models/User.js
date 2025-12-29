const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  // User skill levels for each game type
  skillLevels: {
    mathReflex: { type: Number, default: 1, min: 1, max: 10 },
    memoryBoost: { type: Number, default: 1, min: 1, max: 10 },
    logicPuzzles: { type: Number, default: 1, min: 1, max: 10 },
    wordBuilder: { type: Number, default: 1, min: 1, max: 10 },
    patternMatch: { type: Number, default: 1, min: 1, max: 10 },
    quickQuiz: { type: Number, default: 1, min: 1, max: 10 },
    colorHunt: { type: Number, default: 1, min: 1, max: 10 },
    shapeEscape: { type: Number, default: 1, min: 1, max: 10 }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
