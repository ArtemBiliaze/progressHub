import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './prismaClient.js';
import authRoutes from './auth.js';
import workoutRoutes from './workouts.js';
import reportRoutes from './reports.js';
import commentRoutes from './comments.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/comments', commentRoutes);

// Тестовый маршрут
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$connect();
    res.json({ 
      status: "OK",
      message: "ProgressHub API работает!", 
      database: "Подключено ✅" 
    });
  } catch (error) {
    console.error("Ошибка БД:", error);
    res.status(500).json({ status: "Error", message: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер успешно запущен!`);
  console.log(`🔗 Ссылка: http://localhost:${PORT}/api/health`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Порт ${PORT} уже занят. Попробуй убить процесс или сменить порт в .env`);
  } else {
    console.error(`❌ Ошибка при запуске сервера:`, err);
  }
});