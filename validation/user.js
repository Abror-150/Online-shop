const Joi = require("joi");

const userValidation = {
    register: Joi.object({
        userName: Joi.string().min(3).max(30).required(),
        password: Joi.string().min(6).required(),
        email: Joi.string().email().required(),
        phone: Joi.string().optional(),
        role: Joi.string().valid("user", "admin").optional(),
        regionId: Joi.number().integer().required(),
        image: Joi.string().uri().optional(),
        year: Joi.number().integer().optional()
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
    }),

    update: Joi.object({
        userName: Joi.string().min(3).max(30).optional(),
        password: Joi.string().min(6).optional(),
        email: Joi.string().email().optional(),
        phone: Joi.string().optional(),
        role: Joi.string().valid("user", "admin").optional(),
        regionId: Joi.number().integer().optional(),
        image: Joi.string().uri().optional(),
        year: Joi.number().integer().optional()
    })
};

module.exports = userValidation;
