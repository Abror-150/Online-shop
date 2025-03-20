const Joi = require("joi");

const categorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "Nomi matn bo‘lishi kerak",
    "any.required": "Kategoriya nomi majburiy",
  }),
});

module.exports = { categorySchema };
