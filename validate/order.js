const Joi = require("joi");

const orderSchema = Joi.object({
  userId: Joi.number()
    .integer()
    .required()
   
});

module.exports = orderSchema;
