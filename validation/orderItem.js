const Joi = require("joi");

const orderItemValidation = {
    create: Joi.object({
        orderId: Joi.number().integer().required(),
        productId: Joi.number().integer().required(),
        count: Joi.number().integer().min(1).required()
    }),

    update: Joi.object({
        orderId: Joi.number().integer().optional(),
        productId: Joi.number().integer().optional(),
        count: Joi.number().integer().min(1).optional()
    })
};

module.exports = orderItemValidation;
