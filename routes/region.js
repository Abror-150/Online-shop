const express = require("express");
const { Op } = require("sequelize");
const Region = require("../models/region");
const { regionSchema } = require("../validation/region");
const User = require("../models/user");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Regions
 *   description: Hududlar bilan ishlash API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Region:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Hudud nomi
 *       example:
 *         name: "Toshkent"
 */

/**
 * @swagger
 * /region:
 *   post:
 *     summary: Yangi hudud qo‘shish
 *     tags: [Regions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Region'
 *     responses:
 *       201:
 *         description: Yangi hudud yaratildi
 */
router.post("/", async (req, res) => {
  try {
    const { error } = regionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "Region name is required" });

    const region = await Region.create(req.body);
    res.status(201).json({ message: "Region created successfully", region });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /region/{id}/users:
 *   get:
 *     summary: Regionga tegishli userlarni olish
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID si
 *     responses:
 *       200:
 *         description: Shu regionga tegishli userlar
 *       404:
 *         description: Region topilmadi
 */
router.get("/:id/users", async (req, res) => {
  try {
    const { id } = req.params;
    const region = await Region.findByPk(id, {
      include: [{ model: User }],
    });

    if (!region) {
      return res.status(404).json({ message: "Region not found" });
    }
    if (!region.users || region.users.length === 0) {
      return res
        .status(200)
        .json({ message: "No users found for this region" });
    }
    res.json(region.users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /region/{id}:
 *   get:
 *     summary: Regionni ID bo'yicha olish
 *     description: Berilgan ID bo‘yicha regionni qaytaradi.
 *     tags:
 *       - Regions
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Region ID-si
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Region topildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Toshkent"
 *       404:
 *         description: Region topilmadi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Region topilmadi"
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Server xatosi"
 *                 details:
 *                   type: string
 *                   example: "Some error message"
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let region = await Region.findByPk(id);

    if (!region) {
      return res.status(404).json({ error: "Region topilmadi" });
    }

    res.json(region);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

/**
 * @swagger
 * /region:
 *   get:
 *     summary: Barcha hududlarni olish
 *     tags: [Regions]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Hudud nomi bo‘yicha qidirish
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Sahifalash uchun sahifa raqami
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Sahifada nechta hudud chiqishini belgilash
 *     responses:
 *       200:
 *         description: Hududlar ro‘yxati
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = "id",
      order = "ASC",
      search = "",
    } = req.query;

    const regions = await Region.findAndCountAll({
      where: { name: { [Op.like]: `%${search}%` } },
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [[sort, order.toUpperCase()]],
    });

    res.json({
      totalRecords: regions.count,
      totalPages: Math.ceil(regions.count / limit),
      currentPage: parseInt(page),
      regions: regions.rows,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /region/{id}:
 *   patch:
 *     summary: Hududni yangilash
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hudud ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Region'
 *     responses:
 *       200:
 *         description: Hudud muvaffaqiyatli yangilandi
 */
router.patch("/:id", async (req, res) => {
  try {
    const region = await Region.findByPk(req.params.id);
    if (!region) return res.status(404).json({ message: "Region not found" });

    await region.update(req.body);
    res.json({ message: "Region updated successfully", region });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /region/{id}:
 *   delete:
 *     summary: Hududni o‘chirish
 *     tags: [Regions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Hudud ID si
 *     responses:
 *       200:
 *         description: Hudud muvaffaqiyatli o‘chirildi
 */
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
