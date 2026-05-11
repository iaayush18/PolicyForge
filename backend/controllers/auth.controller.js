/**
 * controllers/auth.controller.js
 */
const prisma = require('../utils/prisma');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { getUserSecret } = require('../utils/auth');

const generateToken = (userId) => {
  const secret = getUserSecret(userId);
  return jwt.sign({ userId }, secret, { expiresIn: '24h' });
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id);

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.email.split('@')[0]
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const verifyUser = async (req, res) => {
  try {
    // req.user.id is already populated by authMiddleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { student: true } // Helpful for the dashboard
    });

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.student?.name || user.email.split('@')[0]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

module.exports = { loginUser, verifyUser };