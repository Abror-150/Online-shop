const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { totp } = require("otplib");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");

const { userSchema } = require("../validation/user");
const {
  sendEmail,
  getToken,
  refreshToken,
  sendSms,
} = require("../functions/eskiz");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");
const Product = require("../models/product");
const roleAuthMiddleware = require("../middlewares/auth");
const route = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Foydalanuvchilar bilan ishlash API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - userName
 *         - email
 *         - password
 *         - phone
 *       properties:
 *         userName:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *         regionId:
 *           type: integer
 *         phone:
 *           type: string
 *         image:
 *           type: string
 *         year:
 *           type: integer
 */
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Barcha foydalanuvchilarni olish
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Barcha foydalanuvchilar ro‘yxati
 */
route.get("/", async (req, res) => {
  let data = await User.findAll();
  res.send(data);
});

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Foydalanuvchilar bilan ishlash
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Foydalanuvchi akkaunt ma’lumotlarini olish
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchi ma’lumotlari
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 userName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 image:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Avtorizatsiya talab qilinadi
 *       404:
 *         description: Foydalanuvchi topilmadi
 *       500:
 *         description: Server xatosi
 */

route.get("/me", roleAuthMiddleware(["user", "admin"]), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Token yaroqsiz yoki mavjud emas" });
    }
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: ["id", "userName", "email", "image", "createdAt"],
    });
    if (!user)
      return res.status(404).json({ error: "Foydalanuvchi topilmadi" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

/**
 * @swagger
 * /user/me:
 *   patch:
 *     summary: Foydalanuvchi ma’lumotlarini yangilash
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *                 example: "Ali Valiyev"
 *               email:
 *                 type: string
 *                 example: "ali@example.com"
 *     responses:
 *       200:
 *         description: Ma’lumotlar yangilandi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Ma'lumotlar yangilandi"
 *       400:
 *         description: Noto‘g‘ri so‘rov ma’lumotlari
 *       401:
 *         description: Avtorizatsiya talab qilinadi
 *       500:
 *         description: Server xatosi
 */

route.patch("/me", roleAuthMiddleware(["user", "admin"]), async (req, res) => {
  try {
    const { userName, email } = req.body;

    await User.update({ userName, email }, { where: { id: req.user.id } });

    res.json({ message: "Ma'lumotlar yangilandi" });
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

/**
 * @swagger
 * /user/me/password:
 *   patch:
 *     summary: Parolni o‘zgartirish
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: "eski parolni kiriting"
 *               newPassword:
 *                 type: string
 *                 example: "yangi parolni kiriting"
 *     responses:
 *       200:
 *         description: Parol muvaffaqiyatli o‘zgartirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Parol muvaffaqiyatli o'zgartirildi"
 *       400:
 *         description: Eski parol noto‘g‘ri
 *       401:
 *         description: Avtorizatsiya talab qilinadi
 *       500:
 *         description: Server xatosi
 */

route.patch(
  "/me/password",
  roleAuthMiddleware(["admin", "user"]),
  async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Eski parol noto'g'ri" });

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.update(
        { password: hashedPassword },
        { where: { id: user.id } }
      );

      res.json({ message: "Parol muvaffaqiyatli o'zgartirildi" });
    } catch (error) {
      res.status(500).json({ error: "Server xatosi", details: error.message });
    }
  }
);

/**
 * @swagger
 * /user/send-otp:
 *   post:
 *     summary: Foydalanuvchiga OTP yuborish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP muvaffaqiyatli yuborildi
 */
route.post("/send-otp", async (req, res) => {
  let { phone } = req.body;
  try {
    let user = await User.findOne({ where: { phone } });
    if (user) {
      return res.status(401).send({ message: "user already exists" });
    }
    let otp = totp.generate(phone + "lorem");
    await sendSms(phone, otp);
    res.send(otp);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/verify-otp:
 *   post:
 *     summary: OTP kodni tekshirish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP muvaffaqiyatli tasdiqlandi
 *       402:
 *         description: Noto‘g‘ri OTP
 */
route.post("/verify-otp", async (req, res) => {
  let { otp, phone } = req.body;
  try {
    let match = totp.verify({ token: otp, secret: phone + "lorem" });
    if (!match) {
      return res.status(402).send({ message: "otp or phone notogri" });
    }
    res.send(match);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Yangi foydalanuvchi yaratish
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               regionId:
 *                 type: integer
 *               phone:
 *                 type: string
 *               image:
 *                 type: string
 *               year:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Foydalanuvchi muvaffaqiyatli yaratildi
 *       400:
 *         description: Xatolik mavjud
 *       401:
 *         description: Foydalanuvchi allaqachon mavjud
 */
route.post("/register", async (req, res) => {
  let { userName, email, password, ...rest } = req.body;
  try {
    const { error } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    let user = await User.findOne({
      where: {
        [Op.or]: [{ userName }, { email }],
      },
    });
    if (user) {
      return res.status(401).send({ message: "user already exists" });
    }
    let hash = bcrypt.hashSync(password, 10);
    let newUser = await User.create({
      ...rest,
      userName,
      email,
      password: hash,
      status: "PENDING",
    });
    let otp = totp.generate(email + "email");
    sendEmail(email, otp);
    res.send(newUser);
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Foydalanuvchi tizimga kirishi
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userName:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tizimga muvaffaqiyatli kirildi
 *       401:
 *         description: Noto‘g‘ri parol
 *       404:
 *         description: Foydalanuvchi topilmadi
 */
route.post("/login", async (req, res) => {
  let { userName, password } = req.body;
  try {
    let user = await User.findOne({ where: { userName } });
    if (!user) {
      return res.status(404).send({ message: "user not found" });
    }
    let match = bcrypt.compareSync(password, user.password);
    if (!match) {
      return res.status(401).send({ message: "wrong password error" });
    }
    let accesToken = getToken(user.id, user.role);
    let refreToken = refreshToken(user);
    res.send({ accesToken, refreToken });
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/refresh:
 *   post:
 *     summary: Token yangilash
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshTok:
 *                 type: string
 *     responses:
 *       200:
 *         description: Yangi token muvaffaqiyatli yaratildi
 *       401:
 *         description: Yaroqsiz token
 */
route.post("/refresh", async (req, res) => {
  let { refreshTok } = req.body;
  try {
    const user = jwt.verify(refreshTok, "refresh");
    const newAccestoken = getToken(user.id);
    res.send({ newAccestoken });
  } catch (error) {
    console.log(error);
  }
});

/**
 * @swagger
 * /user/{id}/orders:
 *   get:
 *     summary: Userga tegishli orderlarni olish
 *     description: Berilgan user ID bo‘yicha barcha orderlarni va ularga tegishli orderItems-larni qaytaradi.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID-si
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Userga tegishli orderlar
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   status:
 *                     type: string
 *                     example: "completed"
 *                   userId:
 *                     type: integer
 *                     example: 2
 *                   orderItems:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *                         product:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 5
 *                             name:
 *                               type: string
 *                               example: "Laptop"
 *                             price:
 *                               type: integer
 *                               example: 1200
 *       404:
 *         description: User yoki orderlar topilmadi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User yoki orderlar topilmadi"
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
route.get("/:id/orders", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User topilmadi" });
    }

    const orders = await Order.findAll({
      where: { userId: id },
      include: [
        {
          model: OrderItem,
          include: [
            {
              model: Product,
              attributes: ["id", "name", "price"],
            },
          ],
        },
      ],
    });

    res.json(orders);
  } catch (error) {
    console.error("Xatolik:", error);
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Foydalanuvchini yangilash
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Foydalanuvchi ID si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Foydalanuvchi muvaffaqiyatli yangilandi
 */

route.patch("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update(req.body);
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Foydalanuvchini o‘chirish
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Foydalanuvchi ID si
 *     responses:
 *       200:
 *         description: Foydalanuvchi muvaffaqiyatli o‘chirildi
 */
route.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /user/myOrder:
 *   get:
 *     summary: Foydalanuvchining buyurtmalarini olish
 *     description: Kirgan foydalanuvchining barcha buyurtmalarini va ularga tegishli orderItems-larni qaytaradi.
 *     tags:
 *        [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Foydalanuvchining buyurtmalari
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   status:
 *                     type: string
 *                     example: "completed"
 *                   userId:
 *                     type: integer
 *                     example: 2
 *                   orderItems:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 10
 *                         quantity:
 *                           type: integer
 *                           example: 2
 *                         product:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 5
 *                             name:
 *                               type: string
 *                               example: "Laptop"
 *                             price:
 *                               type: integer
 *                               example: 1200
 *       401:
 *         description: Avtorizatsiya talab qilinadi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token yo‘q yoki noto‘g‘ri"
 *       403:
 *         description: Ruxsat yo‘q
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Sizga ruxsat berilmagan"
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

route.get(
  "/myOrder",
  roleAuthMiddleware(["admin", "user"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      console.log(userId);

      let data = await Order.findAll({
        where: { userId },
        include: [
          {
            model: OrderItem,
            include: [{ model: Product, attributes: ["id", "name", "price"] }],
          },
        ],
      });
      if (data.length == 0) {
        return res
          .status(404)
          .json({ message: "Sizga tegishli buyurtmalar topilmadi" });
      }
      res.send(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: User ID bo'yicha olish
 *     description: Berilgan ID bo‘yicha userni qaytaradi.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID-si
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User topildi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 userName:
 *                   type: string
 *                   example: "Ali"
 *                 email:
 *                   type: string
 *                   example: "ali@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+998901234567"
 *       404:
 *         description: User topilmadi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "User topilmadi"
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
route.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "Userr topilmadi" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server xatosi", details: error.message });
  }
});

module.exports = route;
