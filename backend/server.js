require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration CORS pour accepter les requêtes du frontend
app.use(cors({
  origin: ['https://reunion-steel.vercel.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Routes
try {
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/membres', require('./src/routes/membres'));
  app.use('/api/cotisations', require('./src/routes/cotisations'));
  console.log('✅ Routes chargées avec succès');
} catch (error) {
  console.error('❌ Erreur chargement routes:', error.message);
}

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});