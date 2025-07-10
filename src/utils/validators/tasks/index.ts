import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createTaskSchema = z.object({
  description: z.string().nonempty({ message: "Description is a required field" }),
  dueDate: z.string().nonempty({ message: "Deadline is a required field" }),
  category: z.string().nonempty({message: "Category is a required field"})
});

const updateTaskSchema = z.object({
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dueDate: z.string().optional(),
  category: z.string().optional()
});

export const validateTaskData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createTaskSchema.parseAsync(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error)
  }
};

export const validateTaskUpdateData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await updateTaskSchema.parseAsync(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error)
  }
};