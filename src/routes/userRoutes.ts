import { Router } from "express";
import { createUser, loginUser } from "../controllers/userController";
import { validateUserData } from "../utils/validators/users";

const router = Router()
//Sign up route
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