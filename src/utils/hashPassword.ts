import bcrypt from "bcrypt";

// Create a Hashed password that will guarantee user credential secrecy at the data layer
const hashPassword = async (password: string): Promise<string> => {  
  return bcrypt.hash(password, 12);
};

// Compare user password input to saved hash password associated to the user
const comparePassword = async (
  userPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(userPassword, hashedPassword);
};

export { hashPassword, comparePassword };
