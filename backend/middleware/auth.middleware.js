/**
 * middleware/auth.middleware.js
 */
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

const { getUserSecret } = require('../utils/auth');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token' });
    }

    // Step 1: decode WITHOUT verifying
    const decoded = jwt.decode(token);
    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: 'Invalid token structure' });
    }

    // Step 2: compute correct secret
    const secret = getUserSecret(decoded.userId);

    // Step 3: verify with correct secret
    const verified = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: verified.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Role checks - Case insensitive to prevent Enum mismatches
const adminOnly = (req, res, next) => {
  if (req.user.role.toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Admin privileges required.' });
  }
  next();
};

const studentOnly = (req, res, next) => {
  if (req.user.role.toUpperCase() !== 'STUDENT') {
    return res.status(403).json({ success: false, message: 'Student privileges required.' });
  }
  next();
};

module.exports = { authMiddleware, adminOnly, studentOnly };