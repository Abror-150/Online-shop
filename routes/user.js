const { Router } = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { totp } = require("otplib");
const jwt = require("jsonwebtoken");
const { userSchema } = require("../validation/user");
const {
  sendEmail,
  getToken,
  refreshToken,
  sendSms,
} = require("../functions/eskiz");
const route = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Foydalanuvchilar bilan ishlash API
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
      return res.status(402).send({ message: "wrong error" });
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
    let user = await User.findOne({ where: { userName } });
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





module.exports = route;
