import User from "../model/User.js";


export const getmyprofile = async(req,res)=>{
    console.log("User ID from auth middleware:", req.user);

    const user = await User.findById(req.user.userId);

    if(!user){
        return  res.status(404).json({message:"User not found"});
    }

    res.status(200).json({
        success:true,
        user

    })


}


export const updateMyprofile = async(req,res)=>{
    const allowedfields =[
    "name",
    "year",
    "collegeEmail",
    "department",
    "year",
    "hostelBlock",
    "roomNumber",
    "profilePicUrl",
    ]
    const updates = {};
      
    allowedfields.forEach((field)=>{
        if(req.body[field] !== undefined){
            updates[field] = req.body[field];
        }
    });

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        {new:true,runValidators:true}
    ).select("otpHash -otpExpiresAt -currentRefreshToken");


    res.status(200).json({
        success:true,
        message:"Profile Updated Successfully",
        user

    })

 

}


export const uploadCollegeId = async(req,res)=>{


    try {

         const {collegeImage} = req.body;

    if(!collegeImage){
        return res.status(400).json({

            success:false,
            message:"College ID images are required"});
    }

    if(!Array.isArray(collegeImage) || collegeImage.length ===0 || collegeImage.length >2){
        return res.status(400).json({
            success:false,
            message:"You can upload maximum 2 college ID images"});
        
    }

    const user = await User.findById(req.user._id);

    user.collegeImage = collegeImage;
    user.verified = true;
    
    await user.save();

    res.status(200).json({
        success:true,
        message:"College ID images uploaded successfully",
        user
    })
        
    } catch (error) {

        res.status(500).json({
            message:error.message
        })
        
    }

}

export const updateSocialLinks = async(req,res)=>{
   
 try {

     const {instagram,linkedin} = req.body;

     const updates = {};

     if(instagram !== undefined){
        updates["socialLinks.instagram"] = instagram;
     }

     if(linkedin !== undefined){
        updates["socialLinks.linkedin"] = linkedin;
     }

     if(Object.keys(updates).length === 0){
        return res.status(400).json({
            success:false,
            message:"No social links provided for update"
        });
     }

     const user = await User.findByIdAndUpdate(
        req.user._id,
        {$set:updates},
        {new:true,runValidators:true,
            select:"otpHash -otpExpiresAt -currentRefreshToken"

    }
     )

     res.status(200).json({
        success:true,
        message:"Social links Updated Successfully",
        socialLinks: user.socialLinks
     });



        
    } catch (error) {
        
        res.status(500).json({
            message:error.message
        })
    }
}