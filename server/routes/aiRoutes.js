const express = require('express');
const router = express.Router();
const { analyzeNote } = require('../controllers/aiController');
const auth = require('../middleware/auth');

// @route   POST api/ai/analyze
// @desc    Analyze note content with AI
// @access  Private
router.post('/analyze', auth, analyzeNote);

module.exports = router;
