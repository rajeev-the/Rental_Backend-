import Joi from "joi";

export const createItem = Joi.object({
  title: Joi.string().min(2).max(60).required(),
  description: Joi.string().max(500).optional(),

  category: Joi.string().required(),

  pricePerDay: Joi.number().min(1).required(),

  deposit: Joi.number().min(0).optional(),

  condition: Joi.string()
    .valid("new", "good", "fair", "poor")
    .default("good"),

  photos: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(5)
    .messages({
      "array.min": "At least 1 image is required",
      "array.max": "You can upload maximum 5 images"
    })
    .optional(),
});

export const updateItem = Joi.object({
  title: Joi.string().min(2).max(60).optional(),
  description: Joi.string().max(500).optional(),
  category: Joi.string().optional(),
  pricePerDay: Joi.number().min(1).optional(),
  deposit: Joi.number().min(0).optional(),
  condition: Joi.string().valid("new", "good", "fair", "poor").optional(),
});
