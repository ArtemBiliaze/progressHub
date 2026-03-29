import express from 'express';
import prisma from './prismaClient.js';
import { authenticateToken } from './middleware/authMiddleware.js';

const router = express.Router();

// 1. СОЗДАТЬ СЛОТ (Только COACH)
router.post('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'COACH') {
    return res.status(403).json({ error: 'Только тренер создает слоты' });
  }

  const { date, timeSlot } = req.body;
  try {
    const newWorkout = await prisma.workout.create({
      data: {
        date: new Date(date),
        timeSlot,
        status: 'FREE',
        coachId: req.user.userId // Привязка к тренеру
      }
    });
    res.status(201).json(newWorkout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. ЗАПИСАТЬСЯ (Только CLIENT)
router.patch('/book/:id', authenticateToken, async (req, res) => {
  try {
    const workout = await prisma.workout.findUnique({ where: { id: parseInt(req.params.id) } });

    if (!workout || workout.status !== 'FREE') {
      return res.status(400).json({ error: 'Слот недоступен' });
    }

    const updated = await prisma.workout.update({
      where: { id: parseInt(req.params.id) },
      data: {
        status: 'BOOKED',
        clientId: req.user.userId
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. ПОЛУЧИТЬ ВСЕ ТРЕНИРОВКИ
router.get('/', authenticateToken, async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      include: { 
        client: { select: { name: true } },
        coach: { select: { name: true } }
      },
      orderBy: { date: 'asc' }
    });
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;