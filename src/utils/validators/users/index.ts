import { z } from "zod";
import { Request, Response, NextFunction } from "express";

const createUserSchema = z.object({
  username: z.string().nonempty({ message: "Username is a required field" }),
  firstName: z.string().nonempty({ message: "First name is a required field" }),
  lastName: z.string().nonempty({ message: "Last name is a required field" }),
  password: z.string().nonempty({message: "Password is a required field"}),
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
