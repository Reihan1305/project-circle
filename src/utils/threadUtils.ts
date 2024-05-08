import *as Joi from "joi";

export const thread = Joi.object({
    content : Joi.string().required(),
    image: Joi.string().allow('')
})