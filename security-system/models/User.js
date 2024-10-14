// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Proszę podać nazwę użytkownika'],
      unique: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Proszę podać pełne imię i nazwisko'],
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Proszę podać hasło'],
    },
    role: {
      type: String,
      enum: ['ADMIN', 'USER'],
      required: true,
      default: 'USER',
    },
    accountBlocked: {
      type: Boolean,
      default: false,
    },
    passwordRestrictionsEnabled: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    passwordExpiresAt: {
      type: Date,
      default: null,
    },
    passwordHistory: {
      type: [String],
      default: [],
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook do haszowania hasła
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // Aktualizacja daty zmiany hasła
  this.passwordChangedAt = Date.now();

  next();
});

// Metoda do sprawdzania poprawności hasła
userSchema.methods.isPasswordValid = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

// Metoda do ustawiania nowego hasła i zarządzania historią
userSchema.methods.setNewPassword = async function (newPassword) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if (this.passwordRestrictionsEnabled && this.passwordHistory.includes(hashedPassword)) {
    throw new Error('Nowe hasło nie może być takie samo jak żadne z poprzednich haseł.');
  }

  // Aktualizacja hasła i historii
  this.password = hashedPassword;
  this.passwordChangedAt = Date.now();
  this.passwordExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dni
  this.passwordHistory.push(hashedPassword);

  // Ograniczenie historii do 5 haseł
  if (this.passwordHistory.length > 5) {
    this.passwordHistory.shift();
  }

  // Zmiana flagi pierwszego logowania
  this.firstLogin = false;

  await this.save();
};

export default mongoose.models.User || mongoose.model('User', userSchema);
