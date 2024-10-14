import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const users = await User.find();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: 'Nie udało się załadować użytkowników.' });
    }
  }

  if (req.method === 'POST') {
    const { username, password, fullName } = req.body;

    // Walidacja
    if (!username || !password || !fullName) {
      return res.status(400).json({ message: 'Wszystkie pola są wymagane.' });
    }

    try {
      const user = new User({ username, password, fullName });
      await user.save();
      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({ message: 'Wystąpił błąd podczas dodawania użytkownika.', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
