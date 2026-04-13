const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: ['Plastic', 'Paper', 'Metal', 'Glass', 'Organic', 'E-Waste'] 
  },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QuizResult', quizResultSchema);