const { Router } = require("express");
const rouleAuthmiddleware = require("../middlewares/auth");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const { orderSchema } = require("../validation/order");

const route = Router();

/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Buyurtmalar bilan ishlash uchun API
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
 *     Order:
 *       type: object
 *       required:
 *         - items
 *       properties:
 *         id:
 *           type: integer
 *           description: Buyurtma ID si
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productName:
 *                 type: string
 *                 description: Mahsulot nomi
 *               count:
 *                 type: integer
 *                 description: Mahsulot soni
 *       example:
 *         id: 1
 *         items:
 *           - productName: "Noutbuk"
 *             count: 2
 */

/**
 * @swagger
 * /order:
 *   get:
 *     summary: Barcha buyurtmalarni olish
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Buyurtmalar ro‘yxati
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
route.get("/", async (req, res) => {
  try {
    let data = await Order.findAll();
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

/**
 * @swagger
 * /order/{id}:
 *   patch:
 *     summary: Buyurtmani yangilash
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Buyurtma ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       200:
 *         description: Buyurtma muvaffaqiyatli yangilandi
 *       404:
 *         description: Buyurtma topilmadi
 */
route.patch("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Order.findByPk(id);
    if (!data) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }
    await data.update(req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

/**
 * @swagger
 * /order/{id}:
 *   delete:
 *     summary: Buyurtmani o‘chirish
 *     tags: [Order]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: O‘chirilayotgan buyurtma ID si
 *     responses:
 *       200:
 *         description: Buyurtma muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Buyurtma topilmadi
 */
route.delete("/:id", async (req, res) => {
  let { id } = req.params;
  try {
    let data = await Order.findByPk(id);
    if (!data) {
      return res.status(404).json({ error: "Buyurtma topilmadi" });
    }
    await data.destroy();
    res.json({ message: "Buyurtma o‘chirildi" });
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

module.exports = route;
