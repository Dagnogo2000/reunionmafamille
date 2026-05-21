const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Récupérer tous les membres
router.get('/', async (req, res) => {
  try {
    const membres = await prisma.membre.findMany({
      include: {
        cotisations: true,
        presences: true,
      },
    });
    res.json(membres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Récupérer un membre par ID
router.get('/:id', async (req, res) => {
  try {
    const membre = await prisma.membre.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        cotisations: true,
        presences: true,
        users: true,
      },
    });
    if (!membre) {
      return res.status(404).json({ error: 'Membre non trouvé' });
    }
    res.json(membre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Créer un membre
router.post('/', async (req, res) => {
  try {
    const { nom, role, actif } = req.body;
    const membre = await prisma.membre.create({
      data: {
        nom,
        role: role || 'Membre',
        actif: actif !== undefined ? actif : 1,
      },
    });
    res.status(201).json(membre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mettre à jour un membre
router.put('/:id', async (req, res) => {
  try {
    const { nom, role, actif } = req.body;
    const membre = await prisma.membre.update({
      where: { id: parseInt(req.params.id) },
      data: { nom, role, actif },
    });
    res.json(membre);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Supprimer un membre
router.delete('/:id', async (req, res) => {
  try {
    await prisma.membre.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: 'Membre supprimé' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
