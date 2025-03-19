const Joi = require("joi");

const productValidation = {
    create: Joi.object({
        userId: Joi.number().integer().required(),
        name: Joi.string().min(3).max(100).required(),
        desc: Joi.string().min(10).max(500).required(),
        price: Joi.number().min(0).required(),
        categoryId: Joi.number().integer().required(),
        image: Joi.string().uri().optional()
    }),

    update: Joi.object({
        userId: Joi.number().integer().optional(),
        name: Joi.string().min(3).max(100).optional(),
        desc: Joi.string().min(10).max(500).optional(),
        price: Joi.number().min(0).optional(),
        categoryId: Joi.number().integer().optional(),
        image: Joi.string().uri().optional()
    })
};

module.exports = productValidation;
