import express from 'express';
import prisma from './prismaClient.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'COACH') {
    return res.status(403).json({ error: 'Только тренер может давать советы' });
  }

  const { reportId, text } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        text,
        reportId: parseInt(reportId),
        trainerId: req.user.userId
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;