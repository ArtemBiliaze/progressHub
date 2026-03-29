import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from './prismaClient.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-progress-key-2026';

// 1. Регистрация нового пользователя
router.post('/register', async (req, res) => {
  const { email, password, name, role } = req.body;

  try {
    // Проверяем, не занят ли email
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Этот email уже зарегистрирован" });
    }

    // Хэшируем пароль (10 кругов соления)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем запись в БД
    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: hashedPassword,
        role: role || 'CLIENT' // По умолчанию создаем клиента
      }
    });

    res.status(201).json({ message: "Пользователь успешно создан!", userId: user.id });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при регистрации: " + error.message });
  }
});

// 2. Вход (Login)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return res.status(401).json({ error: "Пользователь не найден" });
    }

    // Сравниваем введенный пароль с хэшем из базы
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный пароль" });
    }

    // Генерируем токен (действует 24 часа)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: "Ошибка при входе" });
  }
});

export default router;