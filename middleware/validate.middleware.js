export const validate =(schema)=>(req,res,next)=>{
    const data = req.body;

    const {error} = schema.validate(data,{ abortEarly:false});

    if(error){
        return res.status(400).json({
            success:false,
            message:"Validation failed",
            errors:error.details.map((d)=>d.message)
            
        })
    }

    next();
}