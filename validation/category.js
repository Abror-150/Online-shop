const Joi = require("joi");

const categoryValidation = {
    create: Joi.object({
        name: Joi.string().min(3).max(100).required()
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(100).optional()
    })
};

module.exports = categoryValidation;
