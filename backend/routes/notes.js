const express = require('express');
const { body, validationResult } = require('express-validator');
const Note = require('../models/Note');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all notes for user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id })
      .sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single note
router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create note
router.post('/', [
  auth,
  body('title').trim().isLength({ min: 1 }).withMessage('Title is required'),
  body('content').trim().isLength({ min: 1 }).withMessage('Content is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, color, isPinned } = req.body;

    const note = new Note({
      title,
      content,
      tags: tags || [],
      color: color || '#ffffff',
      isPinned: isPinned || false,
      user: req.user._id
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update note
router.put('/:id', [
  auth,
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete note
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;