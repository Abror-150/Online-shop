const Joi = require("joi");

const orderItemSchema = Joi.object({
  orderId: Joi.number().integer().required().messages({
    "number.base": "Order ID butun son bo‘lishi kerak",
    "any.required": "Order ID bo‘sh bo‘lishi mumkin emas",
  }),
  productId: Joi.number().integer().required().messages({
    "any.required": "Product ID bo‘sh bo‘lishi mumkin emas",
  }),
  count: Joi.number().integer().min(1).required().messages({
    "number.min": "Mahsulot soni kamida 1 bo‘lishi kerak",
    "any.required": "Mahsulot soni bo‘sh bo‘lishi mumkin emas",
  }),
});

module.exports = {orderItemSchema};
