import Joi from "joi";

export const updateUserProfile = Joi.object({
  name: Joi.string().min(2).max(40).optional(),
  year: Joi.string().optional(),
  department: Joi.string().optional(),
  hostelBlock: Joi.string().optional(),
  roomNumber: Joi.string().optional(),

  profilePicUrl: Joi.string().uri().optional(),

  // collegeImage: Joi.array()
  //   .items(Joi.string().uri())
  //   .max(2)
  //   .messages({
  //     "array.max": "You can upload maximum 2 college ID images"
  //   })
  //   .optional(),
});
