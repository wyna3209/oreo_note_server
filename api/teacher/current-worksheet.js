const express = require('express');
const router = express.Router();
const Worksheet = require('../../models/Worksheet');
const { getFile } = require('../../drive');

// Get the current worksheet URL
router.get('/', async (req, res) => {
  try {
    const worksheet = await Worksheet.findOne().sort({ uploadedAt: -1 });
    if (!worksheet) {
      return res.status(404).json({ message: 'No worksheet found.' });
    }
    res.json({ imageUrl: worksheet.imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Set the current worksheet using Google Drive file ID
router.post('/', async (req, res) => {
  const { fileId } = req.body;

  try {
    const file = await getFile(fileId);
    const newWorksheet = new Worksheet({ imageUrl: file.webContentLink });
    await newWorksheet.save();

    res.status(200).json({ message: 'Current worksheet updated successfully.', imageUrl: file.webContentLink });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
