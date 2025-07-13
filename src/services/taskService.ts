import { PrismaClient, TaskStatus, Prisma } from "@prisma/client"
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
/**
 * This function takes in the tasks details as provided by the user in payload
 * @param payload - takes in the tasks payload data to save
 * @param loggedInUser - the link to the tasks creator/owner
 * @returns 
 */
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
/**
 * This function performs all user update to the saved tasks
 * @param payload - the update details provided 
 * @param action - determines the update stage i.e starting, completing or cancelling a task
 * @param taskCode - aids in identifying the record uniquely from the database
 * @returns 
 */
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
// This function retrieves a task by the given unique column
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
/**
 * This function retrieves all tasks associated to the logged in user
 * @param page - sets the starting point of each data retrieval request
 * @param limit - sets the chunk size to retrieve
 * @param startDate - helps in filtering the records by date range
 * @param endDate 
 * @param categorySearch - aids in retrieving data grouped by category 
 * @returns 
 */
export const getAllTasks = async(
    loggedInUser: string,
    page: number,
    limit: number,
    startDate?: string,
    endDate?: string,
    categorySearch?: string
)=>{
    try{
        //Get the logged in user
        const user = await getUserByUsername(loggedInUser)
        const offset = (page -1) * limit
        let where: Prisma.TaskWhereInput = {
            NOT: {
                status: 'cancelled'
            },
            userId: user?.id
        };
        if(categorySearch){
            where.OR = [
                {
                    category:{
                        name: categorySearch.toLocaleLowerCase()
                    }
                }
            ]
        } 
        if(startDate && startDate.trim() !== "" && endDate && endDate.trim() !== ""){
            const start = new Date(startDate);
            const end = new Date(endDate);
            if(isNaN(start.getTime()) || isNaN(end.getTime())){
                throw new Error("Invalid date format provided")
            }
            if(start > end){
                throw new Error("Start date cannot be later than end date")
            }
            where = {
                ...where,
                createdAt: {
                    gte: new Date(`${startDate}T00:00:00.000Z`),
                    lte: new Date(`${endDate}T23:59:59.999Z`)
                }
            }
        }
        
        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip: offset,
                take: limit,
                include:{
                    category:{
                        select:{
                            name: true
                        }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                }
            }),
            prisma.task.count({where})
        ])

        return {
            tasks,
            pagination:{
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalTasks: total,
                tasksPerPage: limit
            }
        }
    }catch(error){
        throw error
    }
}
// This function creates a random 4 digit that will be assigned as the task code 
const randomNumber = ():number=>{
    return Math.floor(Math.random() * 900) + 1000;
}