// services/support.service.js

const prisma = require('../utils/prisma');

/**
 * Create a support ticket (student)
 */
const createTicket = async (userId, { type, message, priority, isAnonymous }) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error('Student profile not found');

  const resolvedPriority = priority || 'MEDIUM';
  const shouldEscalateHostel = type === 'HOSTEL' && ['HIGH', 'CRITICAL'].includes(resolvedPriority);

  return await prisma.supportTicket.create({
    data: {
      studentId: student.id,
      type,
      message,
      priority: resolvedPriority,
      isAnonymous: isAnonymous || false,
      ...(shouldEscalateHostel && { status: 'ESCALATED' }),
    },
  });
};

/**
 * Get all tickets submitted by the logged-in student
 */
const getMyTickets = async (userId) => {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error('Student profile not found');

  return await prisma.supportTicket.findMany({
    where: { studentId: student.id },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get all tickets (admin)
 */
const getAllTickets = async (filters = {}) => {
  const where = {};
  if (filters.status) where.status = filters.status;
  if (filters.type) where.type = filters.type;
  if (filters.priority) where.priority = filters.priority;

  const tickets = await prisma.supportTicket.findMany({
    where,
    orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    include: {
      student: {
        select: { name: true, studentId: true, course: true },
      },
    },
  });

  // Enforce anonymity at API-level for admin/support views.
  return tickets.map((t) => (t.isAnonymous ? { ...t, student: null } : t));
};

/**
 * Update ticket status + optional admin notes (admin)
 */
const updateTicket = async (ticketId, { status, priority, adminNotes }) => {
  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(adminNotes !== undefined && { adminNotes }),
    },
    include: {
      student: { select: { name: true, studentId: true } },
    },
  });

  return ticket.isAnonymous ? { ...ticket, student: null } : ticket;
};

/**
 * Get count of open/escalated tickets (for admin badge)
 */
const getPendingCount = async () => {
  return await prisma.supportTicket.count({
    where: { status: { in: ['OPEN', 'ESCALATED'] } },
  });
};

module.exports = { createTicket, getMyTickets, getAllTickets, updateTicket, getPendingCount };
