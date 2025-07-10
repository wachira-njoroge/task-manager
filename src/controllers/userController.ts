import { Request, Response } from "express";
import { createSystemUser, systemLogin } from "../services/userService";
import { signToken } from "../middleware/auth";


export const createUser = async(req: Request, res: Response)=>{
    try{
        await createSystemUser(req.body)
        res.status(201).json({
            success: true,
            message: "Account created successfully. Login to proceed"
        })
    }catch(error:any){
        res.status(500).json({
            success: false,
            message: error.message || "Failed to Sign Up user"
        })
    }
}

export const loginUser = async(req: Request, res: Response)=>{
    try{
        const {username, password} = req.body
        const usr = await systemLogin(username, password)
        const { accessToken, tokenExpiresIn } = await signToken(usr!!)
        //
        res.status(200).json({
            success: true,
            message: "Login Successful",
            data:{
                user:{
                    username: usr?.userName,
                    phone: usr?.phone,
                    email: usr?.email
                },
                accessToken,
                tokenExpiresIn
            }
        })
    }catch(error:any){  
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}