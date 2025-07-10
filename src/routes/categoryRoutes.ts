import { Router } from "express";
import { listCategories, saveCategory } from "../controllers/categoryController";
import { authenticateToken } from "../middleware/auth";

const router = Router()
//Sign up route
router.post(
    "/create",
    authenticateToken,
    saveCategory
)
router.get(
    "/list",
    authenticateToken,
    listCategories
)
export default router