import { PrismaClient, User } from "@prisma/client"
import cleanPhone from "../utils/cleanPhone"
import { comparePassword, hashPassword } from "../utils/hashPassword";

interface UserInfo{
    username: string
    firstName?: string
    lastName?: string
    password: string
    email?: string
    phone?: string
}
const prisma = new PrismaClient()
/**This function creates a new user record after cleaning the 
 * @param userData - takes in the validated user data input
 */
export const createSystemUser = async(userData: UserInfo)=>{
    try{
        let cleanedPhone
        if(userData.phone){
            //clean phone
            cleanedPhone = cleanPhone(userData.phone)
        }
        const user = await prisma.user.findFirst({
            where:{
                OR:[
                    { userName: userData.username},
                    { phone: cleanedPhone}
                ]
            }
        })
        if(user){
            throw new Error("User already exists. Login to proceed")
        }
        const hashedPass = await hashPassword(userData.password)
        return await prisma.user.create({
            data:{
                userName: userData.username,
                firstName: userData.firstName || "",
                lastName: userData.lastName || "",
                phone: cleanedPhone,
                hashedPassword: hashedPass
            }
        })
    }catch(error){
        throw error
    }
}
/**
 * This function returns the user entity record by the given username if it exists..after which the record details are encoded
 * @param username - User identity
 */ 
export const systemLogin = async(username: string, password:string): Promise<User|null>=>{
    try{
        const user = await getUserByUsername(username)
        if(!user){
            throw new Error("Wrong Username or Password")
        }
        const validPass = await comparePassword(password, user.hashedPassword);
        if(!validPass){
            throw new Error("Wrong Username or Password")
        }
        return user
    }catch(error:any){
        throw error
    }
}
// This function retrieves user by username
export const getUserByUsername = async(username: string)=>{
    try{
        return await prisma.user.findFirst({
            where:{
                OR:[
                    { userName: username },
                    { phone: cleanPhone(username) },
                    { email: username}
                ]
            }
        })
    }catch(error){
        throw error
    }
}