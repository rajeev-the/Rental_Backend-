import Joi from "joi";

export const requestRental = Joi.object({
  itemId: Joi.string().required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  meetingLocation: Joi.string().required(),
});

export const uploadBeforeImages = Joi.object({
  beforeImages: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(5)
    .required(),
});

export const uploadAfterImages = Joi.object({
  afterImages: Joi.array()
    .items(Joi.string().uri())
    .min(1)
    .max(5)
    .required(),
});
