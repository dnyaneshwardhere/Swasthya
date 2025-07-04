
const MedicalReport = require('../models/MedicalReport');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
exports.getReports = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Check if user is a doctor or patient and filter accordingly
    if (req.user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      
      if (!doctor) {
        return next(new ErrorResponse('Doctor profile not found', 404));
      }
      
      // Find all reports created by this doctor
      reqQuery.doctor = doctor._id;
    } else if (req.user.userType === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      
      if (!patient) {
        return next(new ErrorResponse('Patient profile not found', 404));
      }
      
      // Find all reports for this patient
      reqQuery.patient = patient._id;
    }

    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Finding resource
    query = MedicalReport.find(JSON.parse(queryStr))
      .populate({
        path: 'doctor',
        select: 'specialization',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate({
        path: 'patient',
        select: 'dateOfBirth gender',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate('appointment', 'date startTime endTime');

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
      query = query.sort('-date');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await MedicalReport.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const reports = await query;

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
      count: reports.length,
      pagination,
      data: reports
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
exports.getReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'specialization',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate({
        path: 'patient',
        select: 'dateOfBirth gender',
        populate: { path: 'user', select: 'name profileImage' }
      })
      .populate('appointment', 'date startTime endTime');

    if (!report) {
      return next(new ErrorResponse(`No report found with id of ${req.params.id}`, 404));
    }

    // Make sure user is the doctor who created the report or the patient it belongs to
    if (req.user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || report.doctor._id.toString() !== doctor._id.toString()) {
        // Doctor can only view reports they created
        return next(new ErrorResponse(`Not authorized to access this report`, 403));
      }
    } else if (req.user.userType === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || report.patient._id.toString() !== patient._id.toString()) {
        // Patient can only view own reports
        return next(new ErrorResponse(`Not authorized to access this report`, 403));
      }
    } else if (req.user.userType !== 'admin') {
      // Only doctors, patients, or admin can view reports
      return next(new ErrorResponse(`Not authorized to access this report`, 403));
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new report
// @route   POST /api/reports
// @access  Private (Doctors only)
exports.createReport = async (req, res, next) => {
  try {
    // Get doctor ID for the logged in user
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }
    
    // Add doctor to request body
    req.body.doctor = doctor._id;
    
    // Create report
    const report = await MedicalReport.create(req.body);
    
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private (Doctors only)
exports.updateReport = async (req, res, next) => {
  try {
    let report = await MedicalReport.findById(req.params.id);
    
    if (!report) {
      return next(new ErrorResponse(`No report found with id of ${req.params.id}`, 404));
    }
    
    // Make sure user is the doctor who created the report
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return next(new ErrorResponse('Doctor profile not found', 404));
    }
    
    if (report.doctor.toString() !== doctor._id.toString() && req.user.userType !== 'admin') {
      return next(new ErrorResponse(`Not authorized to update this report`, 403));
    }
    
    // Update report
    report = await MedicalReport.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Doctors or Admin only)
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await MedicalReport.findById(req.params.id);
    
    if (!report) {
      return next(new ErrorResponse(`No report found with id of ${req.params.id}`, 404));
    }
    
    // Check authorization
    if (req.user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      
      if (!doctor) {
        return next(new ErrorResponse('Doctor profile not found', 404));
      }
      
      if (report.doctor.toString() !== doctor._id.toString()) {
        return next(new ErrorResponse(`Not authorized to delete this report`, 403));
      }
    } else if (req.user.userType !== 'admin') {
      return next(new ErrorResponse(`Not authorized to delete this report`, 403));
    }
    
    await report.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};
