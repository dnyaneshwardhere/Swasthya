
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');
const zoomService = require('../services/zoomService');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    let query;

    // Find user type (doctor or patient)
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.userType === 'doctor') {
      // Find doctor's ID using user ID
      const doctor = await Doctor.findOne({ user: req.user.id });
      
      if (!doctor) {
        return next(new ErrorResponse('Doctor profile not found', 404));
      }
      
      // Find all appointments for this doctor
      query = Appointment.find({ doctor: doctor._id });
    } else if (user.userType === 'patient') {
      // Find patient's ID using user ID
      const patient = await Patient.findOne({ user: req.user.id });
      
      if (!patient) {
        return next(new ErrorResponse('Patient profile not found', 404));
      }
      
      // Find all appointments for this patient
      query = Appointment.find({ patient: patient._id });
    } else if (user.userType === 'admin') {
      // Admins can see all appointments
      query = Appointment.find();
    } else {
      return next(new ErrorResponse('Not authorized to access appointments', 403));
    }

    // Execute query with populate
    const appointments = await query
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee',
        populate: {
          path: 'user',
          select: 'name email phoneNumber profileImage'
        }
      })
      .populate({
        path: 'patient',
        select: 'dateOfBirth gender',
        populate: {
          path: 'user',
          select: 'name email phoneNumber profileImage'
        }
      })
      .sort({ date: 1, startTime: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'specialization consultationFee',
        populate: {
          path: 'user',
          select: 'name email phoneNumber profileImage'
        }
      })
      .populate({
        path: 'patient',
        select: 'dateOfBirth gender',
        populate: {
          path: 'user',
          select: 'name email phoneNumber profileImage'
        }
      });

    if (!appointment) {
      return next(new ErrorResponse(`No appointment found with id ${req.params.id}`, 404));
    }

    // Check if user is authorized to view this appointment
    const user = await User.findById(req.user.id);
    
    if (user.userType === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || appointment.patient._id.toString() !== patient._id.toString()) {
        return next(new ErrorResponse('Not authorized to access this appointment', 403));
      }
    } else if (user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || appointment.doctor._id.toString() !== doctor._id.toString()) {
        return next(new ErrorResponse('Not authorized to access this appointment', 403));
      }
    } else if (user.userType !== 'admin') {
      return next(new ErrorResponse('Not authorized to access this appointment', 403));
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, startTime, endTime, type, reasonForVisit } = req.body;

    // Find the patient
    const patient = await Patient.findOne({ user: req.user.id });
    
    if (!patient) {
      return next(new ErrorResponse('Patient profile not found', 404));
    }

    // Find the doctor
    const doctor = await Doctor.findById(doctorId);
    
    if (!doctor) {
      return next(new ErrorResponse('Doctor not found', 404));
    }

    // Create the appointment
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: patient._id,
      date,
      startTime,
      endTime,
      type,
      reasonForVisit,
      payment: {
        amount: doctor.consultationFee,
        status: 'pending'
      }
    });

    // If it's a video appointment, create a Zoom meeting
    if (type === 'video') {
      const doctorUser = await User.findById(doctor.user);
      const patientUser = await User.findById(patient.user);
      
      // Create Zoom meeting
      const zoomMeeting = await zoomService.scheduleZoomMeeting(
        appointment,
        doctorUser.name,
        patientUser.name
      );

      // Update appointment with Zoom details
      appointment.zoomMeetingDetails = {
        meetingId: zoomMeeting.meetingId,
        password: zoomMeeting.password,
        joinUrl: zoomMeeting.joinUrl,
        hostUrl: zoomMeeting.hostUrl
      };

      await appointment.save();

      // Send notifications
      zoomService.sendZoomMeetingNotification(
        doctorUser.email,
        doctorUser.name,
        zoomMeeting,
        true
      );

      zoomService.sendZoomMeetingNotification(
        patientUser.email,
        patientUser.name,
        zoomMeeting,
        false
      );
    }

    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private
exports.updateAppointment = async (req, res, next) => {
  try {
    let appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse(`No appointment found with id ${req.params.id}`, 404));
    }

    // Check if user is authorized to update this appointment
    const user = await User.findById(req.user.id);
    
    if (user.userType === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || appointment.patient.toString() !== patient._id.toString()) {
        return next(new ErrorResponse('Not authorized to update this appointment', 403));
      }
    } else if (user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return next(new ErrorResponse('Not authorized to update this appointment', 403));
      }
    } else if (user.userType !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this appointment', 403));
    }

    // Update the appointment
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse(`No appointment found with id ${req.params.id}`, 404));
    }

    // Check if user is authorized to delete this appointment
    const user = await User.findById(req.user.id);
    
    // Only admin can delete appointments
    if (user.userType !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete appointments', 403));
    }

    await appointment.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return next(new ErrorResponse(`No appointment found with id ${req.params.id}`, 404));
    }

    // Check if user is authorized to cancel this appointment
    const user = await User.findById(req.user.id);
    
    if (user.userType === 'patient') {
      const patient = await Patient.findOne({ user: req.user.id });
      if (!patient || appointment.patient.toString() !== patient._id.toString()) {
        return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
      }
    } else if (user.userType === 'doctor') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
      }
    } else if (user.userType !== 'admin') {
      return next(new ErrorResponse('Not authorized to cancel this appointment', 403));
    }

    // Update appointment status to cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};
