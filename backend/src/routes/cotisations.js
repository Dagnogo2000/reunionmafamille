const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Récupérer toutes les cotisations
router.get('/', async (req, res) => {
  try {
    const cotisations = await prisma.cotisation.findMany({
      include: { membre: true },
    });
    res.json(cotisations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer une cotisation
router.post('/', async (req, res) => {
  try {
    const { membreId, montant, datePaiement, note } = req.body;
    const cotisation = await prisma.cotisation.create({
      data: {
        membreId,
        montant,
        datePaiement,
        note,
      },
      include: { membre: true },
    });
    res.status(201).json(cotisation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cotisations par membre
router.get('/membre/:membreId', async (req, res) => {
  try {
    const cotisations = await prisma.cotisation.findMany({
      where: { membreId: parseInt(req.params.membreId) },
      include: { membre: true },
    });
    res.json(cotisations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
