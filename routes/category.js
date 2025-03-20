const express = require("express");
const { Op } = require("sequelize");
const Category = require("../models/category");
const router = express.Router();
const roleAuthMiddleware = require("../middlewares/auth");
const { categorySchema } = require("../validation/category");

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Kategoriya bilan ishlash uchun API
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
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Kategoriya nomi
 *       example:
 *         name: Elektronika
 */

/**
 * @swagger
 * /category:
 *   get:
 *     summary: Barcha kategoriyalarni olish
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Kategoriya nomi bo‘yicha qidirish
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Saralash mezoni
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: ASC
 *         description: Saralash tartibi (ASC/DESC)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Sahifa raqami
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Bir sahifada nechta element bo‘lishi kerak
 *     responses:
 *       200:
 *         description: Kategoriyalar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */
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

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Yangi kategoriya qo‘shish
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Yangi kategoriya yaratildi
 *       400:
 *         description: Xatolik, noto‘g‘ri so‘rov
 */
router.post("/", roleAuthMiddleware(["admin"]), async (req, res) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name } = req.body;
    if (!req.body.name) {
      return res
        .status(400)
        .json({ error: "Kategoriya nomi kiritilishi kerak" });
    }
    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Ma'lumot noto‘g‘ri", details: error.message });
  }
});

/**
 * @swagger
 * /category/{id}:
 *   patch:
 *     summary: Kategoriya ma'lumotlarini yangilash
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Kategoriya ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Kategoriya muvaffaqiyatli yangilandi
 *       404:
 *         description: Kategoriya topilmadi
 */
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

/**
 * @swagger
 * /category/{id}:
 *   delete:
 *     summary: Kategoriya o‘chirish
 *     tags: [Category]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chirilayotgan kategoriya ID si
 *     responses:
 *       200:
 *         description: Kategoriya muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Kategoriya topilmadi
 */
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
