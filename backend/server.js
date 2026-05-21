require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/membres', require('./src/routes/membres'));
app.use('/api/cotisations', require('./src/routes/cotisations'));

// Route de test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});