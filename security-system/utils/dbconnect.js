import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI; // Upewnij się, że masz zmienną środowiskową z URL do bazy danych

if (!MONGODB_URI) {
  throw new Error('Proszę zdefiniować zmienną środowiskową MONGODB_URI w .env.local');
}

let isConnected; // Używamy zmiennej do sprawdzania połączenia

export default async function dbConnect() {
  if (isConnected) {
    // Jeśli jesteśmy już połączeni, po prostu zwracamy
    return;
  }

  // Połączenie z bazą danych
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Połączono z MongoDB');
  } catch (error) {
    console.error('Błąd połączenia z MongoDB:', error);
    throw new Error('Nie udało się połączyć z MongoDB');
  }
}
