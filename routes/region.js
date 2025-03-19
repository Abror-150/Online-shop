const express = require("express");
const { Op } = require("sequelize");
const Region = require("../models/region");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        if (!name) return res.status(400).json({ message: "Region name is required" });

        const region = await Region.create({ name });
        res.status(201).json({ message: "Region created successfully", region });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 10, sort = "id", order = "ASC", search = "" } = req.query;
        
        const regions = await Region.findAndCountAll({
            where: { name: { [Op.like]: `%${search}%` } },
            limit: parseInt(limit),
            offset: (page - 1) * limit,
            order: [[sort, order.toUpperCase()]]
        });

        res.json({
            totalRecords: regions.count,
            totalPages: Math.ceil(regions.count / limit),
            currentPage: parseInt(page),
            regions: regions.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.patch("/:id", async (req, res) => {
    try {
        const region = await Region.findByPk(req.params.id);
        
        if (!region) return res.status(404).json({ message: "Region not found" });

       await region.create(req.body)
       res.send(region)

        res.json({ message: "Region updated successfully", region });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const region = await Region.findByPk(req.params.id);
        if (!region) return res.status(404).json({ message: "Region not found" });

        await region.destroy();
        res.json({ message: "Region deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;