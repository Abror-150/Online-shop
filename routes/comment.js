const express = require("express");
const Product = require("../models/product");
const User = require("../models/user");
const Comment = require("../models/comment");
const { commentSchema } = require("../validation/comment");
const { Op } = require("sequelize");
const roleAuthMiddleware = require("../middlewares/auth");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: Foydalanuvchi izohlari bilan ishlash uchun API
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
 *     Comment:
 *       type: object
 *       required:
 *         
 *         - productId
 *         - star
 *         - message
 *       properties:
 *        
 *         productId:
 *           type: integer
 *           description: Mahsulot ID si
 *         star:
 *           type: integer
 *           description: Yulduz bahosi (1-5)
 *         message:
 *           type: string
 *           description: Foydalanuvchi izohi
 *       example:
 *        
 *         productId: 3
 *         star: 5
 *         message: "Zo'r mahsulot!"
 */

/**
 * @swagger
 * /comment:
 *   get:
 *     summary: Barcha izohlarni olish
 *     tags: [Comment]
 *     parameters:
 *       - in: query
 *         name: star
 *         schema:
 *           type: integer
 *         description: Yulduz bahosi bo‘yicha filtr
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Izoh matni bo‘yicha filtr
 *     responses:
 *       200:
 *         description: Izohlar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
router.get("/", async (req, res) => {
  try {
    let filter = {};
    let { star, message } = req.query;
    if (star) {
      filter.star = { [Op.like]: `${star}%` };
    }
    if (message) {
      filter.message = { [Op.like]: `${message}%` };
    }
    const comments = await Comment.findAll({
      where: filter,
      include: [
        { model: User, attributes: ["id", "userName", "email"] },
        { model: Product, attributes: ["id", "name", "price"] },
      ],
    });
    res.json(comments);
  } catch (error) {
    console.log(error);
    
    res.status(500).json({ error: "Server xatosi" });
  }
});

/**
 * @swagger
 * /comment:
 *   post:
 *     summary: Yangi izoh qo‘shish
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Yangi izoh yaratildi
 *       400:
 *         description: Xatolik, noto‘g‘ri so‘rov
 */
router.post("/",roleAuthMiddleware(["user","admin"]), async (req, res) => {
  try {
    const { error } = commentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    const {productId, star, message } = req.body;
    const userId = req.user.id
    const comment = await Comment.create({ userId, productId, star, message });
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: "Ma'lumot noto'g'ri kiritilgan" });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   patch:
 *     summary: Izohni yangilash
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Izoh ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Izoh muvaffaqiyatli yangilandi
 *       404:
 *         description: Izoh topilmadi
 */
router.patch("/:id",roleAuthMiddleware(['admin','user']), async (req, res) => {
  try {
    const { id } = req.params;
    const one = await Comment.findByPk(id);
    await one.update(req.body);
    res.json(one);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

/**
 * @swagger
 * /comment/{id}:
 *   delete:
 *     summary: Izohni o‘chirish
 *     tags: [Comment]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chirilayotgan izoh ID si
 *     responses:
 *       200:
 *         description: Izoh muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Izoh topilmadi
 */
router.delete("/:id",roleAuthMiddleware(['user','admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comment.destroy({ where: { id } });

    if (deleted) {
      res.json({ message: "Izoh o'chirildi" });
    } else {
      res.status(404).json({ error: "Izoh topilmadi" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

module.exports = router;
