const User = require('../models/User');

// @desc    Get all users (Admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({});

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Activate user
// @route   PATCH /api/admin/users/:id/activate
// @access  Private/Admin
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.status === 'active') {
        return res.status(400).json({ success: false, message: 'User already active' });
    }

    user.status = 'active';
    await user.save();

    res.status(200).json({ success: true, message: 'User activated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Deactivate user
// @route   PATCH /api/admin/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: 'Admin cannot deactivate self' });
    }

    if (user.status === 'inactive') {
        return res.status(400).json({ success: false, message: 'User already inactive' });
    }

    user.status = 'inactive';
    await user.save();

    res.status(200).json({ success: true, message: 'User deactivated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (Admin)
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
    try {
        const { fullName, email, password, role } = req.body;

         if (!fullName || !email || !password) {
             return res.status(400).json({ success: false, message: 'Please provide all required fields' });
         }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            role: role || 'user',
        });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                }
            });
        } else {
             res.status(400).json({ success: false, message: 'Invalid user data' });
        }
    } catch (error) {
         res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = { getUsers, activateUser, deactivateUser, createUser };
