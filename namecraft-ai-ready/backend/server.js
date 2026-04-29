import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase, getRow, runQuery, getAllRows } from './database.js';
import { verifyToken, generateToken, registerUser, loginUser, getUserInfo, isPremiumUser } from './auth.js';
import { recordPayment, confirmPaymentAndUpgradePremium, checkPaymentStatus } from './payments.js';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const userId = await registerUser(email, password, name);
    const token = generateToken(userId);
    res.json({ success: true, userId, token, message: 'Registration successful' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await loginUser(email, password);
    const token = generateToken(user.id);
    res.json({ success: true, userId: user.id, token, message: 'Login successful' });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Get user info
app.get('/api/auth/user', verifyToken, async (req, res) => {
  try {
    const user = await getUserInfo(req.userId);
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== GENERATION ROUTES ====================

// Check generation limit
app.get('/api/generations/limit', verifyToken, async (req, res) => {
  try {
    const isPremium = await isPremiumUser(req.userId);
    
    if (isPremium) {
      return res.json({ limit: 'unlimited', remaining: 'unlimited', isPremium: true });
    }

    // Free user limit check
    const today = new Date().toISOString().split('T')[0];
    const limit = await getRow(
      'SELECT * FROM generationLimits WHERE userId = ?',
      [req.userId]
    );

    if (!limit) {
      await runQuery(
        'INSERT INTO generationLimits (userId, generationsToday, lastResetDate) VALUES (?, ?, ?)',
        [req.userId, 0, today]
      );
      return res.json({ limit: 6, remaining: 6, isPremium: false });
    }

    if (limit.lastResetDate !== today) {
      // Reset counter for new day
      await runQuery(
        'UPDATE generationLimits SET generationsToday = 0, lastResetDate = ? WHERE userId = ?',
        [today, req.userId]
      );
      return res.json({ limit: 6, remaining: 6, isPremium: false });
    }

    const remaining = Math.max(0, 6 - limit.generationsToday);
    res.json({ limit: 6, remaining, isPremium: false });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Generate names
app.post('/api/generations/generate', verifyToken, async (req, res) => {
  try {
    const { businessDesc, industry, vibe, audience } = req.body;
    if (!businessDesc) {
      return res.status(400).json({ error: 'Business description required' });
    }

    const isPremium = await isPremiumUser(req.userId);
    
    // Check generation limit for free users
    if (!isPremium) {
      const today = new Date().toISOString().split('T')[0];
      const limit = await getRow(
        'SELECT * FROM generationLimits WHERE userId = ? AND lastResetDate = ?',
        [req.userId, today]
      );

      if (limit && limit.generationsToday >= 6) {
        return res.status(429).json({ error: 'Daily generation limit reached. Upgrade to Premium for unlimited generations!' });
      }

      // Increment counter
      if (limit) {
        await runQuery(
          'UPDATE generationLimits SET generationsToday = generationsToday + 1 WHERE userId = ?',
          [req.userId]
        );
      }
    }

    // Call Gemini API
    const prompt = `You are a world-class branding expert. Generate exactly 6 unique, memorable, brandable business names for:

Business: ${businessDesc}
Industry: ${industry || 'General'}
Tone: ${vibe || 'Professional'}
${audience ? 'Audience: ' + audience : ''}

Rules:
- Each name must be 1-3 words, catchy, easy to spell, and original
- Vary the styles: some can be invented words, metaphors, initials, or descriptive
- Write a punchy tagline (max 8 words) and one sentence on why it works

Respond ONLY with a valid JSON array. No markdown, no backticks, no extra text:
[{"name":"...","tagline":"...","why":"..."},...]`;

    const apiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const raw = apiResponse.data.candidates[0].content.parts[0].text;
    const clean = raw.replace(/```json|```/g, '').trim();
    const names = JSON.parse(clean);

    // Save generation history
    await runQuery(
      `INSERT INTO generations (userId, businessDesc, industry, vibe, audience, names) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.userId, businessDesc, industry, vibe, audience, JSON.stringify(names)]
    );

    res.json({ success: true, names });
  } catch (err) {
    console.error('Generation error:', err.message);
    res.status(500).json({ error: 'Failed to generate names: ' + err.message });
  }
});

// Get generation history
app.get('/api/generations/history', verifyToken, async (req, res) => {
  try {
    const generations = await getAllRows(
      'SELECT * FROM generations WHERE userId = ? ORDER BY createdAt DESC LIMIT 20',
      [req.userId]
    );

    const formattedGenerations = generations.map(gen => ({
      ...gen,
      names: JSON.parse(gen.names)
    }));

    res.json(formattedGenerations);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== SAVED NAMES ROUTES ====================

// Save name
app.post('/api/names/save', verifyToken, async (req, res) => {
  try {
    const { name, tagline, why, notes } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name required' });
    }

    await runQuery(
      `INSERT INTO savedNames (userId, name, tagline, why, notes) 
       VALUES (?, ?, ?, ?, ?)`,
      [req.userId, name, tagline, why, notes]
    );

    res.json({ success: true, message: 'Name saved!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get saved names
app.get('/api/names/saved', verifyToken, async (req, res) => {
  try {
    const names = await getAllRows(
      'SELECT * FROM savedNames WHERE userId = ? ORDER BY createdAt DESC',
      [req.userId]
    );

    res.json(names);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete saved name
app.delete('/api/names/saved/:id', verifyToken, async (req, res) => {
  try {
    await runQuery(
      'DELETE FROM savedNames WHERE id = ? AND userId = ?',
      [req.params.id, req.userId]
    );

    res.json({ success: true, message: 'Name deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== PAYMENT ROUTES ====================

// Initiate payment
app.post('/api/payments/initiate', verifyToken, async (req, res) => {
  try {
    const { paymentMethod, amount, paymentType } = req.body;
    if (!paymentMethod || !amount || !paymentType) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    const result = await recordPayment(req.userId, paymentMethod, amount, null, paymentType);
    
    res.json({ 
      success: true, 
      paymentId: result.id,
      message: `Send ${amount} USDT to ${process.env.USDT_WALLET_ADDRESS}`,
      walletAddress: process.env.USDT_WALLET_ADDRESS
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Verify payment and activate premium
app.post('/api/payments/verify', verifyToken, async (req, res) => {
  try {
    const { txHash, paymentId } = req.body;
    if (!txHash || !paymentId) {
      return res.status(400).json({ error: 'Transaction hash and payment ID required' });
    }

    const result = await confirmPaymentAndUpgradePremium(req.userId, paymentId, txHash);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Check payment status
app.get('/api/payments/status/:txHash', verifyToken, async (req, res) => {
  try {
    const payment = await checkPaymentStatus(req.params.txHash);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ==================== ERROR HANDLING ====================

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`NameCraft Backend running on http://localhost:${PORT}`);
});
