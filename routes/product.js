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
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         id:
 *           type: integer
 *           description: Mahsulot ID si
 *         name:
 *           type: string
 *           description: Mahsulot nomi
 *         description:
 *           type: string
 *           description: Mahsulot tavsifi
 *         image:
 *           type: string
 *           description: Mahsulot rasmi URL
 *         price:
 *           type: number
 *           description: Mahsulot narxi
 *         categoryId:
 *           type: integer
 *           description: Kategoriya ID si
 *       example:
 *         id: 1
 *         name: "Smartfon"
 *         description: "Yangi model smartfon"
 *         image: "https://example.com/image.jpg"
 *         price: 500
 *         categoryId: 3
 */

/**
 * @swagger
 * /product:
 *   get:
 *     summary: Barcha mahsulotlarni olish
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
 *     responses:
 *       200:
 *         description: Mahsulotlar ro‘yxati
 */
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
 */
router.post("/", roleAuthMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
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
 *         description: Mahsulot ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli yangilandi
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
 *         description: Mahsulot ID si
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli o‘chirildi
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
