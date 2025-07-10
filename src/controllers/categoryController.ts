import { Request, Response } from "express"
import { createCategory } from "../services/categoryService"
import { AuthenticatedRequest } from "../middleware/auth"

export const saveCategory = async(req:AuthenticatedRequest, res:Response)=>{
    try{
        await createCategory(req.body)
        res.status(201).json({
            success: true,
            message: "Category creataed successfully"
        })
    }catch(error:any){
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
}