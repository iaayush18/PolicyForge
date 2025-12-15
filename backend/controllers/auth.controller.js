/**
 * controllers/auth.controller.js
 */
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  // 👇 CRITICAL: Using 'userId' to match auth.middleware.js
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 2. Check if active (Middleware compatibility)
    if (user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    // 3. Validate Password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // 4. Update last login
    user.lastLogin = new Date();
    await user.save();

    // 5. Send Response
    const token = generateToken(user._id);

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0]
      },
      token
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Verify token and return current user
// @route   GET /api/auth/verify
// @access  Private
const verifyUser = async (req, res) => {
  try {
    // The user ID is already in req.user because of the authMiddleware
    // We fetch fresh data to ensure the user hasn't been deleted or deactivated
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0], // Fallback name logic
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Verify User Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = { loginUser, verifyUser };