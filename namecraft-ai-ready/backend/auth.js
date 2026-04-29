import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { getRow, runQuery } from './database.js';

// Verify JWT token
export function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Generate JWT token
export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Hash password
export async function hashPassword(password) {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
}

// Compare passwords
export async function comparePassword(password, hash) {
  return bcryptjs.compare(password, hash);
}

// Register user
export async function registerUser(email, password, name) {
  try {
    const existingUser = await getRow('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(password);
    const result = await runQuery(
      'INSERT INTO users (email, password, name) VALUES (?, ?, ?)',
      [email, hashedPassword, name]
    );

    // Initialize generation limit
    await runQuery(
      'INSERT INTO generationLimits (userId, generationsToday, lastResetDate) VALUES (?, ?, ?)',
      [result.id, 0, new Date().toISOString().split('T')[0]]
    );

    return result.id;
  } catch (err) {
    throw err;
  }
}

// Login user
export async function loginUser(email, password) {
  try {
    const user = await getRow('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      throw new Error('User not found');
    }

    const validPassword = await comparePassword(password, user.password);
    if (!validPassword) {
      throw new Error('Invalid password');
    }

    return user;
  } catch (err) {
    throw err;
  }
}

// Get user info
export async function getUserInfo(userId) {
  try {
    const user = await getRow('SELECT id, email, name, isPremium, premiumExpiresAt, createdAt FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  } catch (err) {
    throw err;
  }
}

// Check if user is premium
export async function isPremiumUser(userId) {
  try {
    const user = await getRow('SELECT isPremium, premiumExpiresAt FROM users WHERE id = ?', [userId]);
    if (!user) return false;

    if (user.isPremium && user.premiumExpiresAt) {
      const expiryDate = new Date(user.premiumExpiresAt);
      if (expiryDate < new Date()) {
        // Premium expired, downgrade to free
        await runQuery('UPDATE users SET isPremium = 0 WHERE id = ?', [userId]);
        return false;
      }
    }
    return user.isPremium;
  } catch (err) {
    console.error(err);
    return false;
  }
}
