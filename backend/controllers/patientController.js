
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get patient profile
// @route   GET /api/patients/profile
// @access  Private
exports.getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user.id }).populate({
      path: 'user',
      select: 'name email phoneNumber profileImage'
    });

    if (!patient) {
      return next(new ErrorResponse('Patient profile not found', 404));
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patients/profile
// @access  Private
exports.updatePatientProfile = async (req, res, next) => {
  try {
    let patient = await Patient.findOne({ user: req.user.id });

    if (!patient) {
      // Create a new patient profile if it doesn't exist
      patient = await Patient.create({
        user: req.user.id,
        ...req.body
      });
    } else {
      // Update existing patient
      patient = await Patient.findByIdAndUpdate(patient._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (err) {
    next(err);
  }
};
