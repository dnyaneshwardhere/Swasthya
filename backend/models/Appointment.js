
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please add appointment date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add appointment start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add appointment end time']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled'
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'video'
  },
  zoomMeetingDetails: {
    meetingId: String,
    password: String,
    joinUrl: String,
    hostUrl: String
  },
  reasonForVisit: {
    type: String,
    required: [true, 'Please add reason for visit']
  },
  notes: {
    type: String
  },
  payment: {
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'completed', 'refunded'],
      default: 'pending'
    },
    method: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
