const { Router } = require("express");
const rouleAuthmiddleware = require("../middlewares/auth");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const { orderSchema } = require("../validation/order");
const User = require("../models/user");
const roleAuthMiddleware = require("../middlewares/auth");

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
    let data = await Order.findAll({
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ["id", "name", "price"] }],
        },
        {
          model: User, 
          attributes: ["id", "userName", "email"],
        },
      ],
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});



/**
 * @swagger
 * /order/{id}:
 *   get:
 *     summary: Buyurtma ma'lumotlarini olish
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Buyurtma ID si
 *     responses:
 *       200:
 *         description: Buyurtma ma'lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: Buyurtma ID si
 *                 userId:
 *                   type: integer
 *                   description: Buyurtmani yaratgan foydalanuvchi ID si
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Buyurtma yaratilgan vaqti
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: Buyurtma yangilangan vaqti
 *                 orderItems:
 *                   type: array
 *                   description: Buyurtmadagi mahsulotlar
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: OrderItem ID si
 *                       orderId:
 *                         type: integer
 *                         description: Buyurtma ID si
 *                       productId:
 *                         type: integer
 *                         description: Mahsulot ID si
 *                       count:
 *                         type: integer
 *                         description: Buyurtmadagi mahsulot soni
 *                       product:
 *                         type: object
 *                         description: Mahsulot haqida to‘liq ma’lumot
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Mahsulot ID si
 *                           name:
 *                             type: string
 *                             description: Mahsulot nomi
 *                           price:
 *                             type: number
 *                             description: Mahsulot narxi
 *       404:
 *         description: Buyurtma topilmadi
 *       500:
 *         description: Server xatosi
 */



route.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderItem,
          include: [{ model: Product, attributes: ["id", "name", "price"] }],
        },
        {
          model: User, 
          attributes: ["id", "userName", "email"],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({ error: "Order topilmadi" });
    }

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server xatosi" });
  }
});


/**
 * @swagger
 * /order:
 *   post:
 *     summary: Yangi buyurtma yaratish
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - items
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Buyurtmani yaratgan foydalanuvchi ID si
 *               items:
 *                 type: array
 *                 description: Buyurtma ichidagi mahsulotlar
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - count
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       description: Mahsulot ID si
 *                     count:
 *                       type: integer
 *                       description: Mahsulot soni
 *     responses:
 *       201:
 *         description: Yangi buyurtma yaratildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 orderItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: OrderItem ID si
 *                       orderId:
 *                         type: integer
 *                         description: Buyurtma ID si
 *                       productId:
 *                         type: integer
 *                         description: Mahsulot ID si
 *                       count:
 *                         type: integer
 *                         description: Buyurtmadagi mahsulot soni
 *                       product:
 *                         type: object
 *                         description: Mahsulot haqida to‘liq ma’lumot
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: Mahsulot ID si
 *                           name:
 *                             type: string
 *                             description: Mahsulot nomi
 *                           price:
 *                             type: number
 *                             description: Mahsulot narxi
 *       500:
 *         description: Server xatosi
 */


route.post("/",roleAuthMiddleware(["admin","user"]), async (req, res) => {
  try {
    const { userId, items } = req.body; 

    const order = await Order.create({ userId });

    const orderItems = items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      count: item.count,
    }));

    await OrderItem.bulkCreate(orderItems);

    res.status(201).json({ order, orderItems });
  } catch (error) {
    console.error(error);
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
    res.json({ message: "Buyurtma o'chirildi" });
  } catch (error) {
    res.status(500).json({ error: "Server xatosi" });
  }
});

module.exports = route;
