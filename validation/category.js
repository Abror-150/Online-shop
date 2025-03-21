const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
  }),
});

module.exports = { categorySchema };
