const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().min(2).max(255).required(),
  description: Joi.string().max(1000),
  image: Joi.string().required(),
  userId: Joi.number().integer().positive().required(),
  price: Joi.number().integer().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
});

module.exports = productSchema;
