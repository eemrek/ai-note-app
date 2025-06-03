// server/routes/notes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Auth middleware to protect routes
const noteController = require('../controllers/noteController');
const { check, validationResult } = require('express-validator');

// @route   POST api/notes
// @desc    Create a new note
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Başlık boş bırakılamaz').not().isEmpty(),
      check('content', 'İçerik boş bırakılamaz').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    noteController.createNote(req, res);
  }
);

// @route   GET api/notes
// @desc    Get all notes for the logged-in user
// @access  Private
router.get('/', auth, noteController.getNotes);

// @route   GET api/notes/:id
// @desc    Get a specific note by ID
// @access  Private
router.get('/:id', auth, noteController.getNoteById);

// @route   PUT api/notes/:id
// @desc    Update a note
// @access  Private
router.put(
  '/:id',
  [
    auth,
    [
      check('title', 'Başlık boş olamaz').optional().not().isEmpty(),
      check('content', 'İçerik boş olamaz').optional().not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    noteController.updateNote(req, res);
  }
);

// @route   DELETE api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', auth, noteController.deleteNote);

module.exports = router;
