import Query from '../models/Query.js';
import { asyncHandler } from '../middleware/errorHandler.js';

// GET /api/queries
export const getQueries = asyncHandler(async (req, res) => {
  const queries = await Query.find().sort({ createdAt: -1 });
  res.json(queries);
});

// POST /api/queries
// Creates a new query with status "unanswered". This is the endpoint the
// mobile app will call later when an employee submits a query.
export const createQuery = asyncHandler(async (req, res) => {
  const { employee, name, subject, message } = req.body;

  if (!employee || !name || !subject || !message) {
    res.statusCode = 400;
    throw new Error('employee, name, subject, and message are required.');
  }

  const query = await Query.create({ employee, name, subject, message });
  res.status(201).json(query);
});

// PATCH /api/queries/:id
// Body: { answer: string } — marks the query answered and stores the reply.
export const answerQuery = asyncHandler(async (req, res) => {
  const { answer } = req.body;

  if (!answer || !answer.trim()) {
    res.statusCode = 400;
    throw new Error('answer is required.');
  }

  const query = await Query.findByIdAndUpdate(
    req.params.id,
    { status: 'answered', answer: answer.trim() },
    { new: true }
  );

  if (!query) {
    res.statusCode = 404;
    throw new Error('Query not found.');
  }

  res.json(query);
});
