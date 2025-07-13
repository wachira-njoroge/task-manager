/**
 * This file is intended to validate user payload input whereby user is notified of
 *  fields that dont meet requirements
 */
import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createUserSchema = z.object({
  username: z.string().nonempty({ message: "Username is a required field" }),
  password: z.string().nonempty({message: "Password is a required field"}),
  firstName: z.string().optional(),
  lastName: z.string().optional(),  
  email: z.string().optional(),
  phone: z.string().optional(),
});

export const validateUserData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createUserSchema.parseAsync(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
        })),
      });
    }
    next(error)
  }
};
