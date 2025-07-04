
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    // Enable filtering
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Doctor.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name email phoneNumber profileImage'
    });

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('user.name');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Doctor.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const doctors = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      pagination,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'user',
      select: 'name email phoneNumber profileImage'
    });

    if (!doctor) {
      return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private
exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    // Update fields
    const updatedDoctor = await Doctor.findByIdAndUpdate(doctor._id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'user',
      select: 'name email phoneNumber profileImage'
    });

    res.status(200).json({
      success: true,
      data: updatedDoctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private
exports.updateAvailability = async (req, res, next) => {
  try {
    const { availableSlots } = req.body;

    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    doctor.availableSlots = availableSlots;
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload doctor credentials
// @route   POST /api/doctors/credentials
// @access  Private
exports.uploadCredentials = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }

    // In a real implementation, file uploads would be handled here
    // and stored in a service like AWS S3, then the URLs would be saved
    
    // For now, just update the URLs if they're provided
    if (req.body.licenseDocumentUrl) {
      doctor.licenseDocumentUrl = req.body.licenseDocumentUrl;
    }
    
    if (req.body.certificateDocumentUrl) {
      doctor.certificateDocumentUrl = req.body.certificateDocumentUrl;
    }

    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};
