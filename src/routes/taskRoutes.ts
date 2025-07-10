import { Router } from "express";
import { listTasks, saveTask, updateTask } from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";
import { validateTaskData, validateTaskUpdateData } from "../utils/validators/tasks";

const router = Router()
//Sign up route
router.post(
    "/create",
    authenticateToken,
    validateTaskData,
    saveTask
)
router.patch(
    "/update/:action/:taskCode",
    authenticateToken,
    validateTaskUpdateData,
    updateTask
)
router.get(
    "/list",
    authenticateToken,
    listTasks
)
export default router