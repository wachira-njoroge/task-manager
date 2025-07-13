// This file defines all the available restful APIs that create retrieve values in the Category Entity
import { Router } from "express";
import { listCategories, saveCategory } from "../controllers/categoryController";
import { authenticateToken } from "../middleware/auth";

const router = Router()
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