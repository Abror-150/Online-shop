const Joi = require("joi");

const productSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  description: Joi.string().allow("").max(500), 
  image: Joi.string().uri().allow(""), 
  price: Joi.number().positive().required(),
  categoryId: Joi.number().integer().positive().required(),
});

module.exports = { productSchema };
