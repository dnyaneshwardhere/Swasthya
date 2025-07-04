
const express = require('express');
const { createMeeting, getMeetingDetails } = require('../controllers/zoomController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/meetings', protect, createMeeting);
router.get('/meetings/:id', protect, getMeetingDetails);

module.exports = router;
