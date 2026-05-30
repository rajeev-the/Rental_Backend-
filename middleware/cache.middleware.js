import redis from "../config/redis.js";

export const cacheItemsList = async (req, res, next) => {
  try {
    const { category, search } = req.query;

    const cacheKey = `items:${
      category || "all"
    }:${
      search || ""
    }`;

    const cachedItems = await redis.get(cacheKey);

    if (cachedItems) {
      return res.status(200).json({
        success: true,
        count: JSON.parse(cachedItems).length,
        items: JSON.parse(cachedItems),
        source: "cache",
      });
    }



    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      if (data.success && data.items) {
        console.log("💾 Saving to Redis");

        await redis.set(
          cacheKey,
          JSON.stringify(data.items),
          {
            EX: 3600, // 1 hour
          }
        );
      }

      return originalJson(data);
    };

    next();
  } catch (error) {
    next(error);
  }
};