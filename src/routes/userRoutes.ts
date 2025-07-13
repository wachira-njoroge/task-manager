// This file defines all the available restful APIs that create retrieve values in the User Entity
import { Router } from "express";
import { createUser, loginUser } from "../controllers/userController";
import { validateUserData } from "../utils/validators/users";

const router = Router()
router.post(
    "/signUp",
    validateUserData,
    createUser
)
router.post(
    "/login",
    loginUser
)
export default router