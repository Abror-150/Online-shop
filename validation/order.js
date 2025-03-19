const Joi = require("joi");

const orderValidation = {
    create: Joi.object({
        userId: Joi.number().integer().required(),
        orderItems: Joi.array().items(
            Joi.object({
                productId: Joi.number().integer().required(),
                count: Joi.number().integer().min(1).required()
            })
        ).required()
    }),

    update: Joi.object({
        userId: Joi.number().integer().optional(),
        orderItems: Joi.array().items(
            Joi.object({
                productId: Joi.number().integer().required(),
                count: Joi.number().integer().min(1).required()
            })
        ).optional()
    })
};

module.exports = orderValidation;
