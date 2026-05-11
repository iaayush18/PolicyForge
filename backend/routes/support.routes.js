const express = require('express');
const router = express.Router();
const {
  createTicket,
  getMyTickets,
  getAllTickets,
  updateTicket,
  getPendingCount,
} = require('../controllers/support.controller');
const {
  authMiddleware,
  adminOnly,
  studentOnly,
} = require('../middleware/auth.middleware');

router.use(authMiddleware);

// Student routes
router.post('/', studentOnly, createTicket);
router.get('/my-tickets', studentOnly, getMyTickets);

// Admin routes
router.get('/pending-count', adminOnly, getPendingCount);
router.get('/', adminOnly, getAllTickets);
router.patch('/:id', adminOnly, updateTicket);

module.exports = router;
