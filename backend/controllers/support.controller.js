// controllers/support.controller.js

const supportService = require('../services/support.service');

// @desc    Create support ticket
// @route   POST /api/support
// @access  Private (Student)
const createTicket = async (req, res, next) => {
  try {
    const { type, message, priority, isAnonymous } = req.body;
    const ticket = await supportService.createTicket(req.user.id, {
      type,
      message,
      priority,
      isAnonymous,
    });
    res.status(201).json({ success: true, message: 'Support request submitted', ticket });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get my tickets
// @route   GET /api/support/my-tickets
// @access  Private (Student)
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await supportService.getMyTickets(req.user.id);
    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Get all tickets (admin)
// @route   GET /api/support
// @access  Private (Admin)
const getAllTickets = async (req, res, next) => {
  try {
    const { status, type, priority } = req.query;
    const tickets = await supportService.getAllTickets({ status, type, priority });
    res.json({ success: true, count: tickets.length, tickets });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status/notes (admin)
// @route   PATCH /api/support/:id
// @access  Private (Admin)
const updateTicket = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const ticket = await supportService.updateTicket(req.params.id, {
      status,
      adminNotes,
    });
    res.json({ success: true, message: 'Ticket updated', ticket });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending ticket count
// @route   GET /api/support/pending-count
// @access  Private (Admin)
const getPendingCount = async (req, res, next) => {
  try {
    const count = await supportService.getPendingCount();
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTicket, getMyTickets, getAllTickets, updateTicket, getPendingCount };
