const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MIDDLEWARE ───────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── ROUTES ───────────────────────────────────────────────────
app.use('/api', routes);

// ─── HEX AI CHAT PROXY (Groq - Free) ─────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system } = req.body;

    const groqMessages = [
      { role: 'system', content: system },
      ...messages
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        temperature: 0.7,
        messages: groqMessages
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Groq API error');
    }

    // Return in Anthropic-compatible format so Chatbot.jsx works unchanged
    const replyText = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
    res.json({ content: [{ type: 'text', text: replyText }] });

  } catch (err) {
    console.error('HEX proxy error:', err.message);
    res.status(500).json({ error: { message: err.message || 'AI proxy error' } });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'HEH Healthcare Help Desk API',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── DATABASE CONNECTION ──────────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/helpdesk')
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`🚀 HEH Help Desk Server running on http://localhost:${PORT}`);
      console.log(`📧 Email configured: ${process.env.EMAIL_USER ? 'Yes' : 'No (update .env)'}`);
      console.log(`🤖 HEX AI chat proxy: http://localhost:${PORT}/api/chat`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('💡 Make sure MongoDB is running: mongod');
    process.exit(1);
  });

module.exports = app;