const express = require("express");
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: User, attributes: ["id", "userName", "email"] },
        { model: Category, attributes: ["id", "name"] },
      ],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Ma'lumot noto'g'ri kiritilgan" });
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
    res.status(500).json({ error: "Server xatosi" });
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
    res.status(500).json({ error: "Server xatosi" });
  }
});

module.exports = router;
