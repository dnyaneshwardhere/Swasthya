
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Update user details (name, email, phone)
// @route   PUT /api/users/details
// @access  Private
exports.updateUserDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Don't allow updating email and password from this route
    delete req.body.email;
    delete req.body.password;

    const user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Upload profile image
// @route   PUT /api/users/profile-image
// @access  Private
exports.uploadProfileImage = async (req, res, next) => {
  try {
    // In a real implementation, this would handle file uploads
    // For this example, we just update the profileImage field with the URL
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return next(new ErrorResponse('Please provide an image URL', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: imageUrl },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};
