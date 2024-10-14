// pages/login.js
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [firstLogin, setFirstLogin] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/auth/login', form);

      if (res.data.firstLogin) {
        setFirstLogin(true);
      } else {
        // Przekierowanie w zależności od roli
        if (res.data.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/user');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Wystąpił błąd');
    }
  };

  if (firstLogin) {
    router.push('/change-password');
  }

  return (
    <div className="container">
      <h2>Logowanie</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Identyfikator:</label>
        <input
          type="text"
          name="username"
          id="username"
          value={form.username}
          onChange={handleChange}
          required
        />

        <label htmlFor="password">Hasło:</label>
        <input
          type="password"
          name="password"
          id="password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Zaloguj</button>
      </form>
    </div>
  );
}
