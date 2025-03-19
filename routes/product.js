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
<<<<<<< HEAD
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.json(product);
  } catch (error) {
    res.status(400).json({ error: "Ma'lumot noto'g'ri kiritilgan" });
  }
});
=======

// router.post("/", roleAuthMiddleware(["admin", "seller"]), async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, description, image, price, categoryId } = req.body;
>>>>>>> 4ee8d9a29d4d6305c1aefec3ca35fc841b3e1a03

//     if (!name || !price || !categoryId) {
//       return res
//         .status(400)
//         .json({ error: "Majburiy maydonlar to‘ldirilishi kerak" });
//     }

//     const product = await Product.create({
//       userId,
//       name,
//       description,
//       image,
//       price,
//       categoryId,
//     });

//     res.status(201).json(product);
//   } catch (error) {
//     res
//       .status(400)
//       .json({ error: "Ma'lumot noto‘g‘ri kiritilgan", details: error.message });
//   }
// });

router.post("/", roleAuthMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ error: "Foydalanuvchi autentifikatsiyadan o'tmagan" });
    }

    const userId = req.user.id;
    const { name, description, image, price, categoryId } = req.body;

    // Majburiy maydonlarni tekshirish
    if (!name || !price || !categoryId) {
      return res
        .status(400)
        .json({ error: "Majburiy maydonlar to‘ldirilishi kerak" });
    }

    // Narx musbat son ekanligini tekshirish
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ error: "Narx musbat son bo‘lishi kerak" });
    }

    // Rasm URL bo‘lishini tekshirish
    if (image && typeof image !== "string") {
      return res.status(400).json({ error: "Rasm noto‘g‘ri formatda" });
    }

    const product = await Product.create({
      userId,
      name,
      description: description || "", // Agar description bo‘lmasa, bo‘sh string qo‘yiladi
      image: image || null, // Agar rasm yo‘q bo‘lsa, `null` qo‘yiladi
      price,
      categoryId,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("❌ Mahsulot yaratishda xatolik:", error);
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

router.put(
  "/:id",
  roleAuthMiddleware(["seller", "admin", "super_admin"]),
  async (req, res) => {
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
  }
);

router.delete(
  "/:id",
  roleAuthMiddleware(["seller", "admin"]),
  async (req, res) => {
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
  }
);

module.exports = router;
