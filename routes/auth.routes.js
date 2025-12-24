import { Router } from "express";
import { sendotp, verifyotp ,logout} from "../controllers/auth.controller.js";
import {validate} from  "../middleware/validate.middleware.js"
import {requestlogin} from "../validation/auth.validation.js"
import Joi from "joi";

const router = Router();


router.post("/send-otp",validate(requestlogin),sendotp);

router.post("/verify-otp",validate(
    Joi.object({
        email : Joi.string().email().required().messages({
            "any.required": "Email is required",
            "string.email": "Email must be a valid email address"
        }),
        otp : Joi.string().length(6).required().messages({
            "any.required": "OTP is required",
            "string.length": "OTP must be 6 digits"
        })
    })
),verifyotp);

router.post("/logout",logout)


export default router;