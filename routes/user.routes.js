import { Router } from "express";

import {authenticate} from "../middleware/auth.middleware.js"
import { getmyprofile , updateMyprofile ,uploadCollegeId ,updateSocialLinks} from "../controllers/user.controller.js";


const router = Router();


router.get("/me",authenticate , getmyprofile);


router.patch("/me",authenticate,updateMyprofile);


router.post("/upload-college-id" , authenticate,uploadCollegeId);

router.patch("/me/update-social-link" , authenticate ,updateSocialLinks);




export default router;