const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const membres = await prisma.membre.count();
    const reunions = await prisma.reunion.count();
    const cotisations = await prisma.cotisation.count();
    
    res.json({
      membres,
      reunions,
      cotisations,
      mode: 'admin'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;