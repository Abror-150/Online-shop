const express = require("express");
const { Op } = require("sequelize");
const Category = require("../models/category");
const router = express.Router();
const roleAuthMiddleware = require("../middlewares/auth");

router.get("/", async (req, res) => {
  try {
    const {
      search,
      sortBy = "createdAt",
      order = "ASC",
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = search ? { name: { [Op.like]: `%${search}%` } } : {};

    const categories = await Category.findAll({
      where: whereClause,
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

router.post("/", roleAuthMiddleware(["admin"]), async (req, res) => {
  try {
    if (!req.body.name) {
      return res
        .status(400)
        .json({ error: "Kategoriya nomi kiritilishi kerak" });
    }
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Ma'lumot noto‘g‘ri", details: error.message });
  }
});

router.patch(
  "/:id",
  roleAuthMiddleware(["super_admin", "admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await Category.update(req.body, { where: { id } });

      if (updated) {
        const updatedCategory = await Category.findByPk(id);
        return res.json(updatedCategory);
      }

      res.status(404).json({ error: "Kategoriya topilmadi" });
    } catch (error) {
      res.status(500).json({ error: "Server xatosi", details: error.message });
    }
  }
);

router.delete("/:id", roleAuthMiddleware(["admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.destroy({ where: { id } });

    if (deleted) {
      return res.json({ message: "Kategoriya o‘chirildi" });
    }

    res.status(404).json({ error: "Kategoriya topilmadi" });
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

module.exports = router;
