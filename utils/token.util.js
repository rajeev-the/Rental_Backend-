import jwt from 'jsonwebtoken';
import crtypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();


const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET_REFRESH;



// Hashing function for refresh token ID

export const hashtoken = (tokenId)=>{
    return crtypto.createHash('sha256').update(tokenId).digest('hex');
}

// Create random token id for refresh tokens

export const createTokenId = ()=>{
    return crtypto.randomBytes(16).toString('hex');
}

//create access token 

export const createAccessToken = (payload)=>{
    return jwt.sign(
        payload,
        ACCESS_SECRET,{
        expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
};


//create refresh Token

export const createRefreshToken = (payload)=>{
    return jwt.sign(
        payload
        ,REFRESH_SECRET,{
        expiresIn: REFRESH_TOKEN_EXPIRES_IN
    })
}

//verify access token 

export const veriftyAccessToken = (token)=>{
    return jwt.verify(token,ACCESS_SECRET)
}

//verify refresh token 
 
export const verifyRefreshToken = (token)=>{
    return jwt.verify(token,REFRESH_SECRET)
}