import bcrypt from "bcrypt";

// Hash password
const hashPassword = async (password: string): Promise<string> => {  
  return bcrypt.hash(password, 12);
};

// Compare user password input to saved hash password
const comparePassword = async (
  userPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(userPassword, hashedPassword);
};

export { hashPassword, comparePassword };
