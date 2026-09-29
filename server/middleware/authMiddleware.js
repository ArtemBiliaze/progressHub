import jwt from 'jsonwebtoken';

import { JWT_SECRET } from '../config.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Нужна авторизация" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Токен недействителен" });
    req.user = user;
    next();
  });
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Нужна авторизация" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Недостаточно прав" });
    }

    next();
  };
};
