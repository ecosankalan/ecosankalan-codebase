const express = require('express');
const { protect } = require('../middleware/auth');
const { uploadAiImages } = require('../middleware/upload');
const { scanWaste } = require('../controllers/aiScanController');

const router = express.Router();

// Temporarily bypass protect middleware so you can test without logging in
router.post('/analyze', uploadAiImages, scanWaste);

module.exports = router;
