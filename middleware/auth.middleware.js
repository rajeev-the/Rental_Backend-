import {
  veriftyAccessToken   as verifyAccessToken,
  verifyRefreshToken,
  createRefreshToken,
  createAccessToken,
  createTokenId,
  hashtoken ,
} from "../utils/token.util.js";
import User from "../model/User.js";

export const authenticate = async (req, res, next) => {
  try {
    /* =====================
       1️⃣ ACCESS TOKEN
    ====================== */

    const authHeader = req.headers.authorization;

    if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
      const accessToken = authHeader.split(" ")[1];

      try {
        const decoded = verifyAccessToken(accessToken);
        req.user = decoded;
        console.log(req.user);
        return next(); // ✅ access token valid
      } catch (err) {
        // access token expired → fallback to refresh token
      }
    }

    /* =====================
       2️⃣ REFRESH TOKEN
    ====================== */

    const refreshHeader =
      req.headers["authorization-refresh"] ||
      req.headers["x-refresh-token"];

    if (!refreshHeader || typeof refreshHeader !== "string") {
      return res.status(401).json({ message: "Authentication required" });
    }

    const refreshToken = refreshHeader.startsWith("Bearer ")
      ? refreshHeader.split(" ")[1]
      : refreshHeader;

    /* =====================
       3️⃣ VERIFY REFRESH TOKEN
    ====================== */

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(401).json({ message: "Invald refresh token" });
    }

    if (!payload?.id || !payload?.tokenId) {
      return res
        .status(401)
        .json({ message: "Invalid refresh token payload" });
    }

    /* =====================
       4️⃣ FIND USER & VALIDATE TOKEN ID
    ====================== */
    

    const userId =
      typeof payload.id === "object" ? payload.id.userId : payload.id;

    const user = await User.findById(userId).select("+currentRefreshToken");

    if (!user) {
      return res.status(401).json({ message: "User does not exist" });
    }

    const incomingHash = hashtoken(payload.tokenId);

    if (user.currentRefreshToken !== incomingHash) {
      return res.status(401).json({ message: "Refresh token revoked" });
    }

    /* =====================
       5️⃣ ROTATE TOKENS
    ====================== */

    const newTokenId = createTokenId();

    const newRefreshToken = createRefreshToken(user._id, newTokenId);

    user.currentRefreshToken = hashtoken(newTokenId);
    await user.save();

    const newAccessToken = createAccessToken({
      id: user._id.toString(),
      email: user.email,
    });
     console.log(newAccessToken);

    /* =====================
       6️⃣ SEND TOKENS
    ====================== */

    res.setHeader("x-access-token", newAccessToken);
    res.setHeader("x-refresh-token", newRefreshToken);

    req.user = {
      id: user._id.toString(),
      email: user.email,
    };
    console.log(req);


    return next();
  } catch (error) {
    console.error("auth middleware error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};