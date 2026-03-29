import express from 'express';
import prisma from './prismaClient.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const router = express.Router();

// 1. ОТПРАВИТЬ ОТЧЕТ (CLIENT)
router.post('/', authenticateToken, async (req, res) => {
  const { weight, steps, reflection, photos } = req.body;
  try {
    const report = await prisma.report.create({
      data: {
        weight: parseFloat(weight),
        steps: parseInt(steps),
        reflection,
        photos,
        clientId: req.user.userId
      }
    });
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ПОЛУЧИТЬ ОТЧЕТЫ (С комментариями!)
router.get('/', authenticateToken, async (req, res) => {
  const { userId, role } = req.user;

  try {
    const reports = await prisma.report.findMany({
      where: role === 'COACH' 
        ? {} // В будущем тут будет { coachId: userId } если привяжем клиентов к тренеру
        : { clientId: userId }, // КЛИЕНТ ВИДИТ ТОЛЬКО СВОЁ
      include: { 
        client: { select: { name: true } },
        comments: true 
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;