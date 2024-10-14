// utils/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Tworzenie tokena JWT
export const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Middleware do weryfikacji tokena JWT
export const authenticate = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Brak autoryzacji' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Pobranie pełnych danych użytkownika z bazy
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Użytkownik nie istnieje' });
    }

    if (user.accountBlocked) {
      return res.status(403).json({ message: 'Konto jest zablokowane' });
    }

    // Sprawdzenie wygaśnięcia hasła
    if (user.passwordExpiresAt && new Date() > user.passwordExpiresAt) {
      return res.status(403).json({ message: 'Hasło wygasło. Zmień swoje hasło.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token jest nieprawidłowy' });
  }
};

// Middleware do sprawdzania roli admina
export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Brak uprawnień administratora' });
  }
  next();
};
