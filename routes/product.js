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
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *         - categoryId
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         image:
 *           type: string
 *         price:
 *           type: number
 *         categoryId:
 *           type: integer
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

    res.send({
      total: totalProducts,
      page: parseInt(page),
      limit: parseInt(limit),
      products,
    });
  } catch (error) {
    res.status(500).send({ error: "Server xatosi", details: error.message });
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
 *         application/send:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Yangi mahsulot yaratildi
 *         content:
 *           application/send:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post("/", roleAuthMiddleware(["admin", "seller"]), async (req, res) => {
  try {
    const { error } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).send({ error: error.details[0].message });
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

    res.status(201).send(product);
  } catch (error) {
    res
      .status(400)
      .send({ error: "Ma'lumot noto'g'ri kiritilgan", details: error.message });
  }
});

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Mahsulotni ID bo'yicha olish
 *     description: Berilgan ID bo'yicha bitta mahsulotni chiqaradi.
 *     tags:
 *       - Products
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Mahsulot ID-si
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mahsulot ma'lumotlari
 *         content:
 *           application/send:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Smartfon"
 *                 description:
 *                   type: string
 *                   example: "Yangi model smartfon"
 *                 image:
 *                   type: string
 *                   example: "https://example.com/image.jpg"
 *                 userId:
 *                   type: integer
 *                   example: 2
 *                 price:
 *                   type: integer
 *                   example: 250000
 *                 categoryId:
 *                   type: integer
 *                   example: 3
 *       404:
 *         description: Mahsulot topilmadi
 *         content:
 *           application/send:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mahsulot topilmadi"
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/send:
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
    let product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).send({ error: "Mahsulot topilmadi" });
    }

    res.send(product);
  } catch (error) {
    res.status(500).send({ error: "Server xatosi", details: error.message });
  }
});




/**
 * @swagger
 * /product/{id}:
 *   patch:
 *     summary: Mahsulot ma'lumotlarini yangilash
 *     description: Berilgan ID bo'yicha mahsulotni qisman yangilaydi.
 *     tags:
 *       - Products
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Yangilanishi kerak bo'lgan mahsulot ID-si
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/send:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Yangi mahsulot nomi"
 *               description:
 *                 type: string
 *                 example: "Bu mahsulot haqida batafsil ma'lumot"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               userId:
 *                 type: integer
 *                 example: 1
 *               price:
 *                 type: integer
 *                 example: 250000
 *               categoryId:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Mahsulot muvaffaqiyatli yangilandi
 *         content:
 *           application/send:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mahsulot yangilandi"
 *       404:
 *         description: Mahsulot topilmadi
 *         content:
 *           application/send:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Mahsulot topilmadi"
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/send:
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
router.patch(
  "/:id",
  roleAuthMiddleware(["seller", "admin", "super_admin"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const [updated] = await Product.update(req.body, { where: { id } });

      if (updated) {
        res.send({ message: "Mahsulot yangilandi" });
      } else {
        res.status(404).send({ error: "Mahsulot topilmadi" });
      }
    } catch (error) {
      res.status(500).send({ error: "Server xatosi", details: error.message });
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
        res.send({ message: "Mahsulot o‘chirildi" });
      } else {
        res.status(404).send({ error: "Mahsulot topilmadi" });
      }
    } catch (error) {
      res.status(500).send({ error: "Server xatosi", details: error.message });
    }
  }
);

module.exports = router;
