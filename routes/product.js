const express = require("express");
const { Op } = require("sequelize");
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const roleAuthMiddleware = require("../middlewares/auth");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const {
      search,
      categoryId,
      sortBy = "createdAt",
      order = "DESC",
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = {};
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const products = await Product.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ["id", "userName", "email"] },
        { model: Category, attributes: ["id", "name"] },
      ],
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

router.post("/", roleAuthMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, image, price, categoryId } = req.body;

    if (!name || !price || !categoryId) {
      return res
        .status(400)
        .json({ error: "Majburiy maydonlar to‘ldirilishi kerak" });
    }

    const product = await Product.create({
      userId,
      name,
      description,
      image,
      price,
      categoryId,
    });

    res.status(201).json(product);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Ma'lumot noto‘g‘ri kiritilgan", details: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Product.update(req.body, { where: { id } });

    if (updated) {
      const updatedProduct = await Product.findByPk(id, {
        include: [
          { model: User, attributes: ["id", "userName", "email"] },
          { model: Category, attributes: ["id", "name"] },
        ],
      });
      res.json(updatedProduct);
    } else {
      res.status(404).json({ error: "Mahsulot topilmadi" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Mahsulot o‘chirildi" });
    } else {
      res.status(404).json({ error: "Mahsulot topilmadi" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

module.exports = router;
