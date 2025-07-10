import { Router } from "express";
import { saveCategory } from "../controllers/categoryController";
import { authenticateToken } from "../middleware/auth";

const router = Router()
//Sign up route
router.post(
    "/create",
    authenticateToken,
    saveCategory
)
export default router