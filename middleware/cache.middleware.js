import redis from "../config/redis.js";



export const cacheItemsList = async(req,res,next)=>{
     
    cachekey = "items:list";
      
    const cachedItems = await redis.get(cachekey);

    if(cachedItems){
        return res.json({
            success:true,
            items:JSON.parse(cachedItems),
            source:"cache"
        })
    }

    // intercept res.json to cache the response

    const originalJson = res.json.bind(res);

    res.json = async (data)=>{
        if(data.success && data.items){
            await redis.set(cachekey,JSON.stringify(data.items), 'EX', 3600); // cache for 1 hour
        }
        originalJson(data);
    }

    next();
       
}