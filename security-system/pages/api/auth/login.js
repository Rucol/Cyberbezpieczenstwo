// pages/api/auth/login.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { createToken } from '../../../utils/auth';
import cookie from 'cookie';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metoda nie dozwolona' });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user || user.accountBlocked) {
      return res.status(401).json({ message: 'Login lub Hasło niepoprawny' });
    }

    const isValid = await user.isPasswordValid(password);

    if (!isValid) {
      return res.status(401).json({ message: 'Login lub Hasło niepoprawny' });
    }

    // Sprawdzenie pierwszego logowania
    if (user.firstLogin) {
      // Ustawienie ciasteczka bez tokena
      res.setHeader(
        'Set-Cookie',
        cookie.serialize('token', '', {
          httpOnly: true,
          secure: process.env.NODE_ENV !== 'development',
          sameSite: 'strict',
          maxAge: -1,
          path: '/',
        })
      );
      return res.status(200).json({ firstLogin: true, message: 'Proszę zmienić hasło.' });
    }

    const token = createToken(user);

    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 dni
        path: '/',
      })
    );

    res.status(200).json({ message: 'Zalogowano pomyślnie', role: user.role });
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
}
