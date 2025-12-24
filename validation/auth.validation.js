import Joi from "joi";


export const requestlogin = Joi.object({
    email : Joi.string().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be a valid email address"
    })

})