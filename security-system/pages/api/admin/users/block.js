// pages/api/admin/users/block.js
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../../models/User';
import { authenticate, isAdmin } from '../../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Middleware do autentykacji i autoryzacji
  await authenticate(req, res, () => {});
  await isAdmin(req, res, () => {});

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Metoda nie dozwolona' });
  }

  const { userId, block } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Nie można zablokować administratora' });
    }

    user.accountBlocked = block;
    await user.save();

    res.status(200).json({ message: `Użytkownik został ${block ? 'zablokowany' : 'odblokowany'} pomyślnie.` });
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
}
