const User = require('../models/User');
const { changePasswordSchema, updateProfileSchema } = require('../validators/validationSchemas');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
            errors: error.details
        });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      if (req.body.email && req.body.email !== user.email) {
          const emailExists = await User.findOne({ email: req.body.email });
          if (emailExists) {
              return res.status(400).json({ success: false, message: 'Email already in use' });
          }
      }

      user.fullName = req.body.fullName || user.fullName;
      user.email = req.body.email || user.email;

      const updatedUser = await user.save();

      res.json({
        success: true,
        data: {
            _id: updatedUser._id,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { error } = changePasswordSchema.validate(req.body);
    if (error) {
         return res.status(400).json({
            success: false,
            message: error.details[0].message,
            errors: error.details
        });
    }

    const { oldPassword, newPassword } = req.body;
    
    if (oldPassword === newPassword) {
         return res.status(400).json({ success: false, message: 'New password cannot be the same as old password' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ success: true, message: 'Password updated successfully' });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect old password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getUserProfile, updateUserProfile, changePassword };
