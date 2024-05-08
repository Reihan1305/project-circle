import * as Joi from "joi"

export const reply = Joi.object({
    content :Joi.string().required(),
    image : Joi.string().allow('')
})