// pages/api/admin/users/[id].js
import dbConnect from '../../../../utils/dbConnect';
import User from '../../../../models/User';
import { authenticate, isAdmin } from '../../../../utils/auth';

export default async function handler(req, res) {
  await dbConnect();

  // Middleware do autentykacji i autoryzacji
  await authenticate(req, res, () => {});
  await isAdmin(req, res, () => {});

  const {
    query: { id },
    method,
  } = req;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ message: 'Nie można modyfikować administratora' });
    }

    switch (method) {
      case 'PUT':
        // Aktualizacja użytkownika
        const { fullName, password, role, passwordRestrictionsEnabled, passwordExpiresAt } = req.body;

        if (fullName) user.fullName = fullName;
        if (password) user.password = password; // Hook pre-save automatycznie haszuje hasło
        if (role) user.role = role;
        if (typeof passwordRestrictionsEnabled === 'boolean') user.passwordRestrictionsEnabled = passwordRestrictionsEnabled;
        if (passwordExpiresAt) user.passwordExpiresAt = new Date(passwordExpiresAt);

        await user.save();

        res.status(200).json({ message: 'Użytkownik został zaktualizowany pomyślnie.' });
        break;
      case 'DELETE':
        // Usunięcie użytkownika
        await user.remove();
        res.status(200).json({ message: 'Użytkownik został usunięty pomyślnie.' });
        break;
      default:
        res.setHeader('Allow', ['PUT', 'DELETE']);
        res.status(405).end(`Metoda ${method} nie dozwolona`);
    }
  } catch (error) {
    res.status(500).json({ message: 'Wystąpił błąd serwera' });
  }
}
