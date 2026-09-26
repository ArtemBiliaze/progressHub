import express from 'express';
import prisma from './prismaClient.js';
import { authenticateToken, requireRole } from './middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, requireRole('COACH'), async (req, res) => {

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