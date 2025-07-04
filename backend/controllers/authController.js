const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, userType, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new ErrorResponse('Email already registered', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      userType,
      phoneNumber
    });

    // If registering as a doctor, create doctor profile
    if (userType === 'doctor') {
      const { 
        specialization, 
        experience, 
        licenseNumber, 
        licenseAuthority,
        consultationFee,
        qualifications,
        bio 
      } = req.body;

      await Doctor.create({
        user: user._id,
        specialization,
        experience,
        licenseNumber,
        licenseAuthority,
        consultationFee,
        qualifications: qualifications || [],
        bio: bio || '',
        isVerified: false // New doctors need verification
      });
    }
    
    // If registering as a patient, create patient profile
    if (userType === 'patient') {
      const {
        dateOfBirth,
        gender,
        bloodType,
        allergies,
        medicalHistory
      } = req.body;
      
      await Patient.create({
        user: user._id,
        dateOfBirth,
        gender,
        bloodType,
        allergies: allergies || [],
        medicalHistory: medicalHistory || []
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for demo doctor login
    if (email === 'dr.smith@example.com' && password === 'password123') {
      console.log("Demo doctor login detected");
      
      // Create demo doctor user object with all required fields
      const demoDoctor = {
        _id: 'demo-doctor-id',
        name: 'Dr. Sarah Smith',
        email: 'dr.smith@example.com',
        userType: 'doctor',
        phoneNumber: '555-123-4567',
        profileImage: 'default-profile.jpg',
        // Add any other fields needed by the User model
        getSignedJwtToken: function() {
          return 'demo-doctor-token';
        },
        toObject: function() {
          return {
            _id: 'demo-doctor-id',
            id: 'demo-doctor-id',
            name: 'Dr. Sarah Smith',
            email: 'dr.smith@example.com',
            userType: 'doctor',
            phoneNumber: '555-123-4567',
            profileImage: 'default-profile.jpg',
            specialization: 'Cardiology',
            qualifications: [
              {
                degree: 'MD',
                institution: 'Harvard Medical School',
                year: 2010
              },
              {
                degree: 'PhD',
                institution: 'Johns Hopkins University',
                year: 2012
              }
            ],
            experience: 12,
            consultationFee: 150,
            bio: 'Board-certified cardiologist with over 12 years of experience in treating heart conditions and performing cardiac procedures.'
          };
        }
      };

      return sendTokenResponse(demoDoctor, 200, res);
    }

    // Check for demo patient login
    if (email === 'john@example.com' && password === 'password123') {
      console.log("Demo patient login detected");
      
      // Create demo patient user object with all required fields
      const demoPatient = {
        _id: 'demo-patient-id',
        name: 'John Doe',
        email: 'john@example.com',
        userType: 'patient',
        phoneNumber: '555-987-6543',
        profileImage: 'default-profile.jpg',
        // Add any other fields needed by the User model
        getSignedJwtToken: function() {
          return 'demo-patient-token';
        },
        toObject: function() {
          return {
            _id: 'demo-patient-id',
            id: 'demo-patient-id',
            name: 'John Doe',
            email: 'john@example.com',
            userType: 'patient',
            phoneNumber: '555-987-6543',
            profileImage: 'default-profile.jpg',
            dateOfBirth: '1985-05-15',
            bloodType: 'A+',
            height: 175,
            weight: 70,
            allergies: ['Peanuts', 'Penicillin'],
            chronicConditions: ['Asthma'],
            medications: ['Albuterol', 'Vitamin D']
          };
        }
      };

      return sendTokenResponse(demoPatient, 200, res);
    }

    // Regular login flow
    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide an email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login error:", err);
    next(err);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get additional profile information based on user type
    let profileData = {};
    
    if (user.userType === 'doctor') {
      const doctorProfile = await Doctor.findOne({ user: user._id });
      if (doctorProfile) {
        profileData = doctorProfile.toObject();
      }
    } else if (user.userType === 'patient') {
      const patientProfile = await Patient.findOne({ user: user._id });
      if (patientProfile) {
        profileData = patientProfile.toObject();
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        ...profileData,
        id: user._id // Ensure ID is provided for frontend
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new ErrorResponse('Please provide an email address', 400));
    }

    // For demo purpose, we'll just return a success response
    // In a real application, this would send an email with reset instructions
    
    res.status(200).json({
      success: true,
      data: {
        message: 'If an account exists with that email, a password reset link has been sent'
      }
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Convert mongoose document to plain object to add id field
  const userObject = user.toObject ? user.toObject() : { ...user };
  
  // Add id field that matches the frontend User interface
  if (!userObject.id && userObject._id) {
    userObject.id = userObject._id.toString();
  }
  
  delete userObject._id;
  delete userObject.__v;
  delete userObject.password;

  res.status(statusCode).json({
    success: true,
    token,
    user: userObject
  });
};
