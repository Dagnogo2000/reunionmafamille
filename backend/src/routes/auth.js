const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mon_secret_jwt_123';

// Inscription
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        nom,
        email,
        password: hashedPassword,
        role: role || 'membre',
      },
    });
    
    res.status(201).json({ message: 'Utilisateur créé avec succès', userId: user.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer le profil
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Non authentifié' });
    }
    
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { membre: true },
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: 'Token invalide' });
  }
});

module.exports = router;
