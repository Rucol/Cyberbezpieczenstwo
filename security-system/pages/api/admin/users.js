// pages/api/admin/users.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { authenticate, isAdmin } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Middleware do autentykacji i autoryzacji
  await authenticate(req, res, () => {});
  await isAdmin(req, res, () => {});

  if (req.method === 'GET') {
    // Pobranie listy użytkowników
    try {
      const users = await User.find({}, '-password -passwordHistory');
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Wystąpił błąd serwera' });
    }
  } else if (req.method === 'POST') {
    // Dodanie nowego użytkownika
    const { username, fullName, password, role } = req.body;

    try {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return res.status(400).json({ message: 'Użytkownik o tym identyfikatorze już istnieje.' });
      }

      const newUser = new User({
        username,
        fullName,
        password,
        role: role || 'USER',
        passwordExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dni
      });

      await newUser.save();

      res.status(201).json({ message: 'Użytkownik został dodany pomyślnie.' });
    } catch (error) {
      res.status(500).json({ message: 'Wystąpił błąd serwera' });
    }
  } else {
    res.status(405).json({ message: 'Metoda nie dozwolona' });
  }
}
