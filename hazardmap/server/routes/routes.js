const express = require ("express");
const router = express.Router();
const db = require("../db/db");
const requireAuth = require('../middleware/requireAuth');

//get saved routes for logged in user 


router.get("/", requireAuth, async (req, res) => {
    const user_id = req.user.id;
    try {
        const routes = await db("saved_routes").where({user_id}).orderBy("created_at", "desc");
        res.json(routes);
    } catch (error) {
        res. status(500).json({error:"failes to fetch saved routes"});
    }
});

//post to save a new route


router.post("/", requireAuth, async (req, res) => {
    const {start_address, end_address, start_coords, end_coords} = req.body;
    const user_id = req.user.id;
    try {
        const [newRoute] = await db("saved_routes")
        .insert({start_address, end_address, start_coords, end_coords, user_id})
        .returning("*");
        res.status(201).json(newRoute);
    } catch (err) {
        res.status(500).json({error:"failed to save route"});
    }
});


//delete a saved route

router.delete("/:id", requireAuth, async (req, res) => {
    const {id} = req.params;
    const user_id = req.user.id;
    try {
        const deleted = await db("saved_routes").where({id, user_id}).del();
        if (deleted) {
            res.status(204).json({message: "Route deleted"});
        } else {
            res.status(404).json({error: "Route not found"});
        }
    } catch (err) {
        res.status(500).json({error: "Failed to delete route"});
    }
});

module.exports = router
