const Joi = require("joi");

const regionSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.base": "Nomi matn bo‘lishi kerak",
    "any.required": "Region nomi majburiy",
  }),
});

module.exports = { regionSchema };
