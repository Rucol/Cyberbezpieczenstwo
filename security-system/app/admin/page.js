'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ username: '', password: '', fullName: '' });
  const [editUserId, setEditUserId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (err) {
      setError('Nie udało się załadować użytkowników.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editUserId) {
        await axios.put(`/api/users/${editUserId}`, formData);
        setSuccess('Użytkownik zaktualizowany pomyślnie');
      } else {
        await axios.post('/api/users', formData);
        setSuccess('Użytkownik dodany pomyślnie');
      }
      fetchUsers(); // Refresh user list after adding or editing
      setFormData({ username: '', password: '', fullName: '' });
      setEditUserId(null);
    } catch (err) {
      setError('Wystąpił błąd podczas dodawania lub aktualizacji użytkownika.');
    }
  };

  const handleEdit = (user) => {
    setFormData({ username: user.username, password: '', fullName: user.fullName });
    setEditUserId(user._id);
  };

  const handleDelete = async (userId) => {
    if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchUsers();
      } catch (err) {
        setError('Nie udało się usunąć użytkownika.');
      }
    }
  };

  const handleBlock = async (userId) => {
    try {
      await axios.patch(`/api/users/${userId}/block`);
      fetchUsers();
    } catch (err) {
      setError('Nie udało się zablokować użytkownika.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-6">Panel Administratora</h1>
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="mb-4">
          <label className="block mb-1">Nazwa użytkownika:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Pełne imię i nazwisko:</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="border rounded p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Hasło:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!editUserId} // Only require password when adding a user
            className="border rounded p-2"
          />
        </div>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {editUserId ? 'Zaktualizuj użytkownika' : 'Dodaj użytkownika'}
        </button>
      </form>
      <h2 className="text-xl mb-4">Lista użytkowników</h2>
      <ul className="w-full max-w-md">
        {users.map((user) => (
          <li key={user._id} className="flex justify-between items-center p-2 border-b">
            <span>{user.fullName} ({user.username})</span>
            <div>
              <button onClick={() => handleEdit(user)} className="text-blue-500 mx-2">Edytuj</button>
              <button onClick={() => handleDelete(user._id)} className="text-red-500 mx-2">Usuń</button>
              <button onClick={() => handleBlock(user._id)} className="text-yellow-500">Zablokuj</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
