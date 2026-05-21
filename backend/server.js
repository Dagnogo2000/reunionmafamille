require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes (vérifie que les chemins sont corrects)
try {
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/membres', require('./src/routes/membres'));
  app.use('/api/cotisations', require('./src/routes/cotisations'));
  console.log('✅ Routes chargées avec succès');
} catch (error) {
  console.error('❌ Erreur lors du chargement des routes:', error.message);
}

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// Démarrer le serveur sur 0.0.0.0 (nécessaire pour Render)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});