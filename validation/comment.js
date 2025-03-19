const Joi = require("joi");

const commentValidation = {
    create: Joi.object({
        userId: Joi.number().integer().required(),
        productId: Joi.number().integer().required(),
        star: Joi.number().integer().min(1).max(5).required(),
        message: Joi.string().min(10).max(1000).optional()
    }),

    update: Joi.object({
        star: Joi.number().integer().min(1).max(5).optional(),
        message: Joi.string().min(10).max(1000).optional()
    })
};

module.exports = commentValidation;
