// pages/api/user/change-password.js
import dbConnect from '../../../utils/dbConnect';
import User from '../../../models/User';
import { authenticate } from '../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Middleware do autentykacji
  await authenticate(req, res, () => {});

  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Metoda nie dozwolona' });
  }

  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Nowe hasła się nie zgadzają' });
  }

  try {
    const user = await User.findById(req.user.id);

    const isValid = await user.isPasswordValid(currentPassword);

    if (!isValid) {
      return res.status(401).json({ message: 'Obecne hasło jest niepoprawne' });
    }

    // Ustawienie nowego hasła
    await user.setNewPassword(newPassword);

    res.status(200).json({ message: 'Hasło zostało zmienione pomyślnie' });
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
}
