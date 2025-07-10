import { Request, Response } from "express"
import { AuthenticatedRequest } from "../middleware/auth"
import { createTask, updateTaskDetails } from "../services/taskService"
import { success } from "zod"

export const saveTask = async(req:AuthenticatedRequest, res:Response)=>{
    try{
        const taskInfo = await createTask(req.body, req.user!!.username)
        res.status(201).json({
            success: true,
            message: "Task created successfully",
            data: taskInfo
        })
    }catch(error:any){
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
}

export const updateTask = async(req: AuthenticatedRequest, res: Response)=>{
    try{
        if(!req.params.action){
            throw new Error("Please provide the update action type")
        }
        if(!req.params.taskCode){
            throw new Error("Please provide the update action type")
        }
        const updatedTask = await updateTaskDetails(req.body, req.params.action, req.params.taskCode)
        res.status(200).json({
            success: true,
            message: "Update Successful",
            data: updatedTask
        })
    }catch(error:any){
        res.status(500).json({
            success: false,
            message: error.message || "Something went wrong"
        })
    }
}