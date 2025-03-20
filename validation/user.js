const Joi = require("joi");

const userSchema = Joi.object({
  userName: Joi.string().min(3).max(50).required().messages({
    "string.empty": "Foydalanuvchi nomi bo‘sh bo‘lishi mumkin emas",
    "string.min": "Foydalanuvchi nomi kamida 3 ta belgi bo‘lishi kerak",
    "string.max": "Foydalanuvchi nomi eng ko‘pi bilan 50 ta belgi bo‘lishi kerak",
    "any.required": "Foydalanuvchi nomi majburiy",
  }),

  password: Joi.string().min(6).required().messages({
    "string.min": "Parol kamida 6 ta belgidan iborat bo‘lishi kerak",
    "any.required": "Parol majburiy",
  }),

  regionId: Joi.number().integer().positive().allow(null).messages({
    "number.base": "regionId raqam bo‘lishi kerak",
  }),

  role: Joi.string()
    .valid("admin", "user", "super_admin", "seller")
    .default("user")
    .messages({
      "any.only": "Role faqat admin, user, super_admin yoki seller bo‘lishi mumkin",
    }),

  email: Joi.string().email().required().messages({
    "string.email": "Email noto‘g‘ri formatda",
    "any.required": "Email majburiy",
  }),

  phone: Joi.string()
    .pattern(/^\+998[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Telefon raqam +998XXXXXXXXX formatida bo‘lishi kerak",
      "any.required": "Telefon raqam majburiy",
    }),

  image: Joi.string().uri().allow(null, "").messages({
    "string.uri": "Rasm URL bo‘lishi kerak",
  }),

  year: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
    "number.base": "Tug‘ilgan yil raqam bo‘lishi kerak",
    "number.min": "Tug‘ilgan yil 1000 yildan katta bo‘lishi kerak",
    "number.max": "Tug‘ilgan yil joriy yildan katta bo‘lishi mumkin emas",
    "any.required": "Tug‘ilgan yil majburiy",
  }),
});

module.exports = {userSchema};
