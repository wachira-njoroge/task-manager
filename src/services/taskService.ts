import { PrismaClient, TaskStatus } from "@prisma/client"
import { getCategoryByName } from "./categoryService"
import { getUserByUsername } from "./userService"

interface TaskInfo{
    description: string
    dueDate: string
    status: string
    startDate: string
    endDate: string
    category: string
}
//
const prisma = new PrismaClient()
//
export const createTask = async(payload: TaskInfo, loggedInUser:string)=>{
    try{
        const usr = await getUserByUsername(loggedInUser)
        //Validate if category exists
        const category = await getCategoryByName(payload.category)
        if(!category){
            throw new Error("Category not found")
        }
        return await prisma.task.create({
            data:{
                code: `TSK-${randomNumber()}`,
                status: TaskStatus.pending,
                description: payload.description,
                dueDate: new Date(payload.dueDate),
                categoryId: category.id,
                userId: usr!!.id
            }
        })
    }catch(error:any){
        throw error
    }
}
export const updateTaskDetails = async(payload: TaskInfo, action: string, taskCode:string)=>{
    try{
        const taskToUpdate = await getTaskByCode(taskCode)
        if(!taskToUpdate){
            throw new Error("Invalid")
        }
        let data: Record<string, any> = {}
        switch(action){
            case "start": {
                data = {
                    startDate: new Date(payload.startDate),
                    status: TaskStatus.in_progress
                }
                break;
            }
            case "complete": {
                data = {
                    endDate: new Date(payload.endDate),
                    status: TaskStatus.completed
                }
                break;
            }
            case "cancel":{
                data = {
                    status: TaskStatus.cancelled
                }
                break;
            }
            case "details": {
                data = {
                    description: payload.description,
                    dueDate: (payload.dueDate) ? new Date(payload.dueDate) : taskToUpdate.dueDate
                }
                break;
            }
            default:{
                return
            }
        }
        if(payload.category){
            //Get the category name povided
            const category = await getCategoryByName(payload.category)
            if(!category){
                throw new Error("Invalid Category provided")
            }
            data["categoryId"] = category.id 
        }
        return await prisma.task.update({
            where:{
                id: taskToUpdate.id
            },
            data
        })
    }catch(error){
        throw error
    }
}
export const getTaskByCode = async(code:string)=>{
    try{
         return await prisma.task.findUnique({
            where: {
                code
            }
         })
    }catch(error){
        throw error
    }
}
const randomNumber = ():number=>{
    return Math.floor(Math.random() * 900) + 1000;
}