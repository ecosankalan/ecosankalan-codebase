const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const quizController = require('../controllers/quizController');

// Ensure this matches your controller method name
router.post('/submit', protect, quizController.submitQuiz);

// 🚨 THIS IS THE MISSING LINE CAUSING THE CRASH 🚨
module.exports = router;