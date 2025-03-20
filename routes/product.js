const express = require("express");
const { Op } = require("sequelize");
const Product = require("../models/product");
const User = require("../models/user");
const Category = require("../models/category");
const roleAuthMiddleware = require("../middlewares/auth");
const { productSchema } = require("../validation/product");
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Mahsulotlar bilan ishlash API
 */

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Barcha mahsulotlarni olish (filter, sort, pagination bilan)
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Mahsulot nomi bo‘yicha qidirish
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Mahsulot kategoriyasi ID si
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: Mahsulot egasining ID si
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimal narx filtri
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maksimal narx filtri
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, createdAt]
 *         description: Sort qilish maydoni
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *         description: Sort tartibi
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Sahifa raqami
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Har bir sahifadagi mahsulotlar soni
 *     responses:
 *       200:
 *         description: Mahsulotlar ro‘yxati
 */
router.get("/", async (req, res) => {
  try {
    const {
      search,
      categoryId,
      userId,
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      order = "DESC",
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = {};
    if (search) whereClause.name = { [Op.like]: `%${search}%` };
    if (categoryId) whereClause.categoryId = categoryId;
    if (userId) whereClause.userId = userId;
    if (minPrice) whereClause.price = { [Op.gte]: parseFloat(minPrice) };
    if (maxPrice)
      whereClause.price = {
        ...whereClause.price,
        [Op.lte]: parseFloat(maxPrice),
      };

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const totalProducts = await Product.count({ where: whereClause });
    const products = await Product.findAll({
      where: whereClause,
      include: [
        { model: User, attributes: ["id", "userName", "email"] },
        { model: Category, attributes: ["id", "name"] },
      ],
      order: [[sortBy, order.toUpperCase()]],
      limit: parseInt(limit),
      offset,
    });

    res.json({
      total: totalProducts,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});
/**
 * @swagger
 * /product:
 *   post:
 *     summary: Yangi mahsulot qo‘shish
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Yangi mahsulot yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post("/", roleAuthMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const userId = req.user.id;
    const { name, description, image, price, categoryId } = req.body;

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

/**
 * @swagger
 * /product/{id}:
 *   put:
 *     summary: Mahsulot ma'lumotlarini yangilash
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Yangilanayotgan mahsulotning ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
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

/**
 * @swagger
 * /product/{id}:
 *   delete:
 *     summary: Mahsulotni o‘chirish
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chirilayotgan mahsulotning ID si
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Mahsulot topilmadi
 */
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
