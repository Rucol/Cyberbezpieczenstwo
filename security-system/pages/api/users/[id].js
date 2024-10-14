import User from '@/models/User';
import dbConnect from '@/utils/dbConnect';

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const user = await User.findById(id);

      if (!user) {
        return res.status(404).json({ message: 'Użytkownik nie znaleziony' });
      }

      // Przykład, jak blokować i odblokowywać użytkownika
      user.accountBlocked = !user.accountBlocked; // Zmiana statusu blokady

      await user.save();
      return res.status(200).json(user);
    } catch (error) {
      return res.status(400).json({ message: 'Wystąpił błąd podczas aktualizacji użytkownika.', error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
