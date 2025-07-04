
const express = require('express');
const {
  updateUserDetails,
  updateUserProfile,
  uploadProfileImage
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/details', protect, updateUserDetails);
router.put('/profile', protect, updateUserProfile);
router.put('/profile-image', protect, uploadProfileImage);

module.exports = router;
