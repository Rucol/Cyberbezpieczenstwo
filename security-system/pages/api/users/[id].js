import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  if (req.method === 'PUT') {
    const { username, fullName, password } = req.body;

    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
      }

      user.username = username;
      user.fullName = fullName;

      if (password) {
        user.password = password; // Hash password as in your User model's pre-save hook
      }

      await user.save();
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: 'Wystąpił błąd podczas aktualizacji użytkownika.' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      await User.findByIdAndDelete(id);
      return res.status(204).send();
    } catch (error) {
      return res.status(400).json({ message: 'Wystąpił błąd podczas usuwania użytkownika.' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony.' });
      }

      user.accountBlocked = !user.accountBlocked; // Toggle block status
      await user.save();
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: 'Wystąpił błąd podczas blokowania użytkownika.' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
