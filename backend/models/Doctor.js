
const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add your specialization']
  },
  qualifications: [{
    degree: {
      type: String,
      required: [true, 'Please add your degree']
    },
    institution: {
      type: String,
      required: [true, 'Please add the institution name']
    },
    year: {
      type: Number,
      required: [true, 'Please add the graduation year']
    }
  }],
  experience: {
    type: Number,
    required: [true, 'Please add your years of experience']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add your license number'],
    unique: true
  },
  licenseAuthority: {
    type: String,
    required: [true, 'Please add the issuing medical council']
  },
  licenseDocumentUrl: {
    type: String,
  },
  certificateDocumentUrl: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    startTime: String,
    endTime: String
  }],
  consultationFee: {
    type: Number,
    required: [true, 'Please add your consultation fee']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Doctor', DoctorSchema);
