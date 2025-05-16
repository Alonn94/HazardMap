const express = require("express");
const router = express.Router();
const db = require("../db/db");
const requireAuth = require('../middleware/requireAuth');

// POST - Add a new comment
router.post("/", requireAuth, async (req, res) => {
    const { hazard_id, content } = req.body;
    const user_id = req.user.id;
  
    console.log("Incoming comment:", { hazard_id, content, user_id });
  
    if (!hazard_id || !content) {
      return res.status(400).json({ error: 'hazard_id and content are required' });
    }
  
    try {
      const [newComment] = await db('comments')
        .insert({ hazard_id, user_id, content }) // ✅ matches DB column
        .returning("*");
  
      res.status(201).json(newComment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ error: "Failed to add comment" });
    }
  });

// GET - Get all comments for a specific hazard
router.get('/hazard/:hazard_id', async (req, res) => {
  const { hazard_id } = req.params;

  try {
    const comments = await db('comments')
      .where({ hazard_id })
      .orderBy('created_at', 'desc')
      .limit(4);

    res.json(comments);
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});
// DELETE - Remove a specific comment
router.delete('/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;
  
    try {
      const comment = await db('comments').where({ id }).first();
  
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      if (comment.user_id !== user_id) {
        return res.status(403).json({ error: 'Not authorized to delete this comment' });
      }
  
      await db('comments').where({ id }).del();
      res.status(200).json({ message: 'Comment deleted' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  });

module.exports = router;