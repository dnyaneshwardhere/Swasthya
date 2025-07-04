
const mongoose = require('mongoose');

const MedicalReportSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  title: {
    type: String,
    required: [true, 'Please add a report title']
  },
  date: {
    type: Date,
    default: Date.now
  },
  symptoms: [String],
  diagnosis: [String],
  treatment: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String
    }],
    procedures: [String],
    recommendations: [String]
  },
  notes: {
    type: String
  },
  attachments: [{
    name: String,
    fileUrl: String,
    fileType: String
  }],
  isPrivate: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MedicalReport', MedicalReportSchema);
