import { Request, Response } from "express"
import { createCategory, getAllCategories } from "../services/categoryService"
import { AuthenticatedRequest } from "../middleware/auth"

//This function fowards validated category payload details to the category service, for creation
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
// This function returns all the saved system categories
export const listCategories = async(req:AuthenticatedRequest, res:Response)=>{
    try{
        const categories = await getAllCategories()
        res.status(201).json({
            success: true,
            message: "Categories found",
            data: categories
        })
    }catch(error:any){
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
}