// Правильный server/prismaClient.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'], // Это поможет видеть ошибки БД в терминале
});

export default prisma;