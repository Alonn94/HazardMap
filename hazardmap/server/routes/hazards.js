const express = require("express");
const router = express.Router();
const db = require("../db/db");
const requireAuth = require('../middleware/requireAuth');

//POST /API/hazards - ADD A NEW HAZARD

router.post("/", requireAuth, async (req, res) => {
    const {title, latitude, longitude, description, type, severity,image} = req.body;
    const user_id = req.user.id;
    try {
        const [newHazard] = await db ('hazards')
            .insert({title, latitude, longitude, description, type, severity,image, user_id})
            .returning("*");
        res.status(201).json(newHazard);
    } catch (error) {
        console.error("Error adding hazard:", error);
        res.status(500).json({error: "Failed to add hazard"});
    }
    console.log("POST /api/hazards called with:", req.body);
}
);

// GET /api/hazards - Fetch all hazards, with optional filters and sorting
router.get('/', async (req, res) => {
    const { type, severity, user } = req.query;
  
    try {
      let query = db('hazards');
  
      if (user) {
        query = query.where('user_id', user);
      }
  
      if (type) {
        query = query.where('type', type);
      }
  
      if (severity) {
        query = query.where('severity', severity);
      }
  
      query = query.orderBy('created_at', 'desc');
  
      const hazards = await query.select('*');
      res.status(200).json(hazards);
    } catch (error) {
      console.error('Error fetching hazards:', error.message);
      res.status(500).json({ error: 'Failed to fetch hazards' });
    }
  });

  // GET /api/hazards/:id - Get hazard by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const hazard = await db('hazards').where({ id }).first();
  
      if (!hazard) {
        return res.status(404).json({ error: 'Hazard not found' });
      }
  
      res.json(hazard);
    } catch (error) {
      console.error('Error fetching hazard by ID:', error.message);
      res.status(500).json({ error: 'Failed to fetch hazard' });
    }
  });

  // DELETE /api/hazards/:id - Delete hazard

router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const hazard = await db('hazards').where({ id }).first();

    if (!hazard) {
      return res.status(404).json({ error: 'Hazard not found' });
    }

    if (Number(hazard.user_id) !== Number(user_id)) {
      return res.status(403).json({ error: 'Unauthorized to delete this hazard' });
    }

    await db('hazards').where({ id }).del();
    res.json({ message: 'Hazard deleted successfully' });
  } catch (error) {
    console.error('Error deleting hazard:', error.message);
    res.status(500).json({ error: 'Failed to delete hazard' });
  }
});

// PATCH /api/hazards/:id - Partially update a hazard
router.patch('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;
    const user_id = req.user.id;
  
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
  
    try {
      const hazard = await db('hazards').where({ id }).first();
  
      if (!hazard) {
        return res.status(404).json({ error: 'Hazard not found' });
      }
  
      if (Number(hazard.user_id) !== Number(user_id)) {
        return res.status(403).json({ error: 'Unauthorized to update this hazard' });
      }
  
      const [updatedHazard] = await db('hazards')
        .where({ id })
        .update(updateFields)
        .returning('*');
  
      res.status(200).json(updatedHazard);
    } catch (error) {
      console.error('Error updating hazard:', error.message);
      res.status(500).json({ error: 'Failed to update hazard' });
    }
  });

module.exports = router;

