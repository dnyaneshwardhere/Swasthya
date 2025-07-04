
const ErrorResponse = require('../utils/errorResponse');
const zoomService = require('../services/zoomService');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Create a Zoom meeting
// @route   POST /api/zoom/meetings
// @access  Private
exports.createMeeting = async (req, res, next) => {
  try {
    const { topic, startTime, duration, patientId } = req.body;

    // Validate required fields
    if (!topic || !startTime || !duration) {
      return next(new ErrorResponse('Please provide topic, start time, and duration', 400));
    }

    // Get the doctor (if doctor is creating the meeting)
    const doctor = await Doctor.findOne({ user: req.user.id }).populate('user', 'name email');
    
    // If no doctor found, check if user is a patient
    if (!doctor && req.user.userType !== 'patient' && req.user.userType !== 'admin') {
      return next(new ErrorResponse('Not authorized to create meetings', 403));
    }

    let patientName = '';
    let patientEmail = '';

    // If doctor is creating meeting, get patient info
    if (doctor && patientId) {
      const patient = await Patient.findById(patientId).populate('user', 'name email');
      if (patient) {
        patientName = patient.user.name;
        patientEmail = patient.user.email;
      }
    }

    // Create the Zoom meeting
    const meetingDetails = await zoomService.createZoomMeeting(
      topic,
      startTime,
      duration,
      doctor ? doctor.user.name : req.user.name,
      patientName
    );

    // Send email notifications if doctor and patient info available
    if (doctor) {
      zoomService.sendZoomMeetingNotification(
        doctor.user.email,
        doctor.user.name,
        meetingDetails,
        true
      );
      
      if (patientEmail) {
        zoomService.sendZoomMeetingNotification(
          patientEmail,
          patientName,
          meetingDetails,
          false
        );
      }
    }

    res.status(201).json({
      success: true,
      data: meetingDetails
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get Zoom meeting details
// @route   GET /api/zoom/meetings/:id
// @access  Private
exports.getMeetingDetails = async (req, res, next) => {
  try {
    const meetingId = req.params.id;

    // In a real implementation, this would call the Zoom API
    // For this example, we're returning mock data
    const meetingDetails = {
      meetingId,
      topic: "Medical Consultation",
      startTime: new Date().toISOString(),
      duration: 30,
      password: "password123",
      joinUrl: `https://zoom.us/j/${meetingId}?pwd=password123`,
      hostUrl: `https://zoom.us/s/${meetingId}?pwd=password123`,
      status: "waiting"
    };

    res.status(200).json({
      success: true,
      data: meetingDetails
    });
  } catch (err) {
    next(err);
  }
};
