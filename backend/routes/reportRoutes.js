
const express = require('express');
const {
  getReports,
  getReport,
  createReport,
  updateReport,
  deleteReport
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(protect, getReports)
  .post(protect, authorize('doctor'), createReport);

router.route('/:id')
  .get(protect, getReport)
  .put(protect, authorize('doctor'), updateReport)
  .delete(protect, authorize('doctor', 'admin'), deleteReport);

module.exports = router;
