const express = require("express");
const router = express.Router();
const db = require("../db/db");

//POST /API/hazards - ADD A NEW HAZARD

router.post("/", async (req, res) => {
    const {title, latitude, longitude, description} = req.body;
    try {
        const [newHazard] = await db ('hazards')
            .insert({title, latitude, longitude, description})
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
    const { type, severity } = req.query;
  
    try {
      let query = db('hazards');
  
      if (type) {
        query = query.where('type', type);
      }
  
      if (severity) {
        query = query.where('severity', severity);
      }
  
      // Sort first to oldest
      query = query.orderBy('created_at', 'desc');
  
      const hazards = await query.select('*');
      res.json(hazards);
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
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      const deletedCount = await db('hazards').where({ id }).del();
  
      if (deletedCount === 0) {
        return res.status(404).json({ error: 'Hazard not found' });
      }
  
      res.json({ message: 'Hazard deleted successfully' });
    } catch (error) {
      console.error('Error deleting hazard:', error.message);
      res.status(500).json({ error: 'Failed to delete hazard' });
    }
  });

// PATCH /api/hazards/:id - Partially update a hazard
router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;
  
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }
  
    try {
      const updated = await db('hazards')
        .where({ id })
        .update(updateFields)
        .returning('*');
  
      if (updated.length === 0) {
        return res.status(404).json({ error: 'Hazard not found' });
      }
  
      res.status(200).json(updated[0]);
    } catch (error) {
      console.error('Error updating hazard:', error.message);
      res.status(500).json({ error: 'Failed to update hazard' });
    }
  });


module.exports = router;

