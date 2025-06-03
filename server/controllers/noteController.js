// server/controllers/noteController.js
const Note = require('../models/Note');

// Create a new note
exports.createNote = async (req, res) => {
  const { title, content, tags, color, isPinned, isArchived } = req.body;
  const userId = req.user.id; // Comes from auth middleware

  try {
    const newNote = new Note({
      user: userId,
      title,
      content,
      tags: tags || [],
      color: color || '#ffffff', // Default color
      isPinned: isPinned || false,
      isArchived: isArchived || false,
    });

    const note = await newNote.save();
    res.status(201).json(note);
  } catch (err) {
    console.error('Create Note Error:', err.message);
    res.status(500).send('Sunucu Hatası (Not Oluşturma)');
  }
};

// Get all notes for the logged-in user
exports.getNotes = async (req, res) => {
  try {
    // Fetch notes for the user, sort by updatedAt in descending order (newest first)
    const notes = await Note.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    console.error('Get Notes Error:', err.message);
    res.status(500).send('Sunucu Hatası (Notları Getirme)');
  }
};

// Get a specific note by ID
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ msg: 'Not bulunamadı' });
    }

    // Ensure the note belongs to the logged-in user
    if (note.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Yetkisiz erişim (not kullanıcıya ait değil)' });
    }

    res.json(note);
  } catch (err) {
    console.error('Get Note By ID Error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Not bulunamadı (geçersiz ID formatı)' });
    }
    res.status(500).send('Sunucu Hatası (Not Detayı Getirme)');
  }
};

// Update an existing note
exports.updateNote = async (req, res) => {
  const { title, content, tags, color, isPinned, isArchived } = req.body;
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    let note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ msg: 'Not bulunamadı' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== userId) {
      return res.status(401).json({ msg: 'Yetkisiz erişim' });
    }

    // Build note object based on what's in the request body
    const noteFields = {};
    if (title !== undefined) noteFields.title = title;
    if (content !== undefined) noteFields.content = content;
    if (tags !== undefined) noteFields.tags = tags;
    if (color !== undefined) noteFields.color = color;
    if (isPinned !== undefined) noteFields.isPinned = isPinned;
    if (isArchived !== undefined) noteFields.isArchived = isArchived;
    // Add aiSummary if present in the request body
    if (req.body.aiSummary !== undefined) {
      noteFields.aiSummary = req.body.aiSummary;
    }
    noteFields.updatedAt = Date.now(); // Update the updatedAt timestamp

    note = await Note.findByIdAndUpdate(
      noteId,
      { $set: noteFields },
      { new: true } // Return the updated document
    );

    res.json(note);
  } catch (err) {
    console.error('Update Note Error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Not bulunamadı (geçersiz ID formatı)' });
    }
    res.status(500).send('Sunucu Hatası (Not Güncelleme)');
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  const noteId = req.params.id;
  const userId = req.user.id;

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ msg: 'Not bulunamadı' });
    }

    // Check if the user owns the note
    if (note.user.toString() !== userId) {
      return res.status(401).json({ msg: 'Yetkisiz erişim' });
    }

    await Note.findByIdAndDelete(noteId);

    res.json({ msg: 'Not başarıyla silindi' });
  } catch (err) {
    console.error('Delete Note Error:', err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Not bulunamadı (geçersiz ID formatı)' });
    }
    res.status(500).send('Sunucu Hatası (Not Silme)');
  }
};
