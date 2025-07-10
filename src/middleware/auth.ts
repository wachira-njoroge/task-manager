import { User } from "@prisma/client"
import { NextFunction, Response, Request } from "express"
import jwt from 'jsonwebtoken'

interface AuthenticatedToken{
    username:string
    email: string | null
    phone:string | null
}
export interface AuthenticatedRequest extends Request{
    user?: {
        username: string
        email: string | null
        phone:string | null
    }
}

export const authenticateToken = async(req: AuthenticatedRequest, res: Response, next: NextFunction)=>{
    const authHeader = req.headers["authorization"]
    const token = authHeader && authHeader.split(" ")[1]

    if(!token){
        return res.status(401).json({
            succes:false,
            message: "Unauthorized"
        })
    }

    try{
        const user = await verifyToken(token)
        req.user = user
        next()
    }catch(error:any){
        return res.status(403).json({
            success:false,
            message: "Invalid or expired access token"
        })
    }

}

export const signToken = async(user:User)=>{
    const tokenData: AuthenticatedToken = {
        username: user.userName,
        email: user.email,
        phone: user.phone
    }
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
        throw new Error("JWT secret key is not defined");
    }
    const accessToken = jwt.sign(tokenData, secret, {expiresIn: "40m"})
    return { accessToken, tokenExpiresIn: 2400}
}

const verifyToken = async(token: string): Promise<AuthenticatedToken> => {
    try {
        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
            throw new Error("JWT secret key is not defined");
        }
        return jwt.verify(token, secret) as AuthenticatedToken;
    } catch (error: any) {
        throw new Error(" Invalid access token")
    }
}