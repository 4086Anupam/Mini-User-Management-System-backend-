const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { signupSchema, loginSchema } = require('../validators/validationSchemas');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { error } = signupSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details
      });
    }

    const { fullName, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error) {
       return res.status(400).json({
        success: false,
        message: error.details[0].message,
        errors: error.details
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'active') {
        return res.status(401).json({ success: false, message: 'Account is inactive' });
      }

      user.lastLogin = Date.now();
      await user.save();

      res.json({
        success: true,
        data: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { signup, login, getMe };
