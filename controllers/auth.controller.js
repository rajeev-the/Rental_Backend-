import crptyo from 'crypto';
import User from '../model/User.js';
import { createAccessToken,createRefreshToken  } from '../utils/token.util.js';
import {sendEmail} from '../utils/email.util.js';
import { createHash } from "node:crypto";




//send otp controller


export const sendotp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 2️⃣ Hash OTP
    const otpHash = createHash("sha256").update(otp).digest("hex");

    // 3️⃣ Expiry (5 minutes)
    const otpExpiresAt = Date.now() + 5 * 60 * 1000;

    // 4️⃣ Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        otpHash,
        otpExpiresAt,
      });
    } else {
      user.otpHash = otpHash;
      user.otpExpiresAt = otpExpiresAt;
      await user.save();
    }

    // 5️⃣ Send email
    await sendEmail({
      to: email,
      subject: "Rental App OTP Verification",
      html: `
        <h3>Your OTP is ${otp}</h3>
        <p>Valid for 5 minutes.</p>
      `,
    });

    // 6️⃣ Response
    res.json({
      success: true,
      message: "OTP sent to email",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};



//verify otp controller


export const verifyotp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    // 1️⃣ Find valid user with non-expired OTP
    const user = await User.findOne({
      email,
      otpExpiresAt: { $gt: Date.now() },
    }).select("+otpHash +otpExpiresAt email currentRefreshToken");

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or OTP expired",
      });
    }

    // 2️⃣ Hash incoming OTP
    const incomingOtpHash = createHash("sha256")
      .update(otp)
      .digest("hex");

      console.log("Incoming OTP Hash:", incomingOtpHash);
        console.log("Stored OTP Hash:", user.otpHash);

    // 3️⃣ Compare OTP
    if (incomingOtpHash !== user.otpHash) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // 4️⃣ Generate tokens
    const accessToken = createAccessToken({
      userId: user._id.toString(),
      email: user.email,
    });

    const refreshToken = createRefreshToken({
      userId: user._id.toString(),
      email: user.email,
    });

    // 5️⃣ Save refresh token & clear OTP
    user.currentRefreshToken = refreshToken;
    user.otpHash = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    // 6️⃣ Set refresh token cookie
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 7️⃣ Send response
    res.json({
      success: true,
      accessToken,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};


//logout controller

export const logout = async(req,res)=>{
    try {
        const refreshToken = req.cookies.refresh_token;

        if(!refreshToken){{
            return res.status(400).json({
                success:false,
                message:"Logout is successfully"
            })
        }
            
        }

        await User.findOneAndUpdate({currentRefreshToken:refreshToken},{
            currentRefreshToken:null
        })

        res.clearCookie("refresh_token",{
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        })

        return res.status(200).json({
            success:true,
            message:"Logout is successfully"
        })
        
    } catch (error) {
        console.error("Logout Error:",error);
        return res.status(500).json({
            success:false,
            message:"Logout failed"
        })
        
    }
    
}