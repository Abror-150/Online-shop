const Joi = require("joi");

const commentSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "number.base": "Foydalanuvchi ID raqam bo‘lishi kerak",
    "any.required": "Foydalanuvchi ID majburiy",
  }),
  productId: Joi.number().integer().optional().messages({
    "number.base": "Mahsulot ID raqam bo‘lishi kerak",
  }),
  star: Joi.number().integer().min(1).max(10).optional().messages({
    "number.base": "Reyting raqam bo‘lishi kerak",
    "number.min": "Reyting kamida 1 bo‘lishi kerak",
    "number.max": "Reyting ko‘pi bilan 10 bo‘lishi kerak",
  }),
  message: Joi.string().min(3).max(500).required().messages({
    "string.base": "Xabar matn bo‘lishi kerak",
    "string.min": "Xabar kamida 3 ta harfdan iborat bo‘lishi kerak",
    "string.max": "Xabar 500 ta harfdan oshmasligi kerak",
    "any.required": "Xabar majburiy",
  }),
});

module.exports = { commentSchema };
