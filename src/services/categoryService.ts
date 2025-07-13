import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
// This function takes in a category name string, validates if there is a similar and creates one if there's none
export const createCategory = async(category:{name:string})=>{
    try{
        //validate if category is exists
        const newCategory = await getCategoryByName(category.name)
        if(newCategory){
            throw new Error("Category already exists")
        }
        return await prisma.category.create({
            data:{
                name: category.name
            }
        })
    }catch(error:any){
        throw error
    }
}
// This function retrieves category by name
export const getCategoryByName = async(name:string)=>{
    try{
        return await prisma.category.findUnique({
            where:{
                name
            }
        })
    }catch(error:any){
        throw error
    }
}
// This function retrieves all categories
export const getAllCategories = async()=>{
    try{
        return await prisma.category.findMany()   
    }catch(error:any){
        throw error
    }
}