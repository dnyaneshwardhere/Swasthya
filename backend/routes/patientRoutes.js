
const express = require('express');
const {
  getPatientProfile,
  updatePatientProfile
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', protect, authorize('patient', 'admin'), getPatientProfile);
router.put('/profile', protect, authorize('patient'), updatePatientProfile);

module.exports = router;
