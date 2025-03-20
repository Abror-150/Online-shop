const Joi = require("joi");

const orderSchema = Joi.object({
  userId: Joi.number().integer().required().messages({
    "number.base": "Foydalanuvchi ID raqam bo‘lishi kerak",
    "any.required": "Foydalanuvchi ID majburiy",
  }),
});

module.exports = { orderSchema };
