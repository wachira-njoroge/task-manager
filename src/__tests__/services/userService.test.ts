// Mock Prisma client at the very top
const mockPrisma = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
  },
};
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

import { createSystemUser, systemLogin, getUserByUsername } from '../../services/userService';
import { hashPassword, comparePassword } from '../../utils/hashPassword';
import cleanPhone from '../../utils/cleanPhone';

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createSystemUser', () => {
    const mockUserData = {
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      password: 'password123',
      email: 'test@example.com',
      phone: '+1234567890',
    };

    const mockCleanedPhone = '+1234567890';
    const mockHashedPassword = 'hashedPassword123';

    beforeEach(() => {
      (cleanPhone as jest.Mock).mockReturnValue(mockCleanedPhone);
      (hashPassword as jest.Mock).mockResolvedValue(mockHashedPassword);
    });

    it('should create a new user successfully', async () => {
      // Mock user not found
      mockPrisma.user.findFirst.mockResolvedValue(null);
      
      // Mock successful user creation
      const mockCreatedUser = {
        id: 1,
        userName: mockUserData.username,
        firstName: mockUserData.firstName,
        lastName: mockUserData.lastName,
        phone: mockCleanedPhone,
        hashedPassword: mockHashedPassword,
      };
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await createSystemUser(mockUserData);

      expect(cleanPhone).toHaveBeenCalledWith(mockUserData.phone);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { userName: mockUserData.username },
            { phone: mockCleanedPhone },
          ],
        },
      });
      expect(hashPassword).toHaveBeenCalledWith(mockUserData.password);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: mockUserData.username,
          firstName: mockUserData.firstName,
          lastName: mockUserData.lastName,
          phone: mockCleanedPhone,
          hashedPassword: mockHashedPassword,
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should create user without optional fields', async () => {
      const minimalUserData = {
        username: 'testuser',
        password: 'password123',
      };

      mockPrisma.user.findFirst.mockResolvedValue(null);
      
      const mockCreatedUser = {
        id: 1,
        userName: minimalUserData.username,
        firstName: '',
        lastName: '',
        phone: null,
        hashedPassword: mockHashedPassword,
      };
      mockPrisma.user.create.mockResolvedValue(mockCreatedUser);

      const result = await createSystemUser(minimalUserData);

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          userName: minimalUserData.username,
          firstName: '',
          lastName: '',
          phone: undefined,
          hashedPassword: mockHashedPassword,
        },
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should throw error when user already exists', async () => {
      const existingUser = {
        id: 1,
        userName: mockUserData.username,
      };
      mockPrisma.user.findFirst.mockResolvedValue(existingUser);

      await expect(createSystemUser(mockUserData)).rejects.toThrow(
        'User already exists. Login to proceed'
      );

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findFirst.mockRejectedValue(dbError);

      await expect(createSystemUser(mockUserData)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('systemLogin', () => {
    const mockUsername = 'testuser';
    const mockPassword = 'password123';
    const mockHashedPassword = 'hashedPassword123';

    const mockUser = {
      id: 1,
      userName: mockUsername,
      hashedPassword: mockHashedPassword,
    };

    beforeEach(() => {
      (comparePassword as jest.Mock).mockResolvedValue(true);
    });

    it('should login successfully with valid credentials', async () => {
      // Mock getUserByUsername to return a user
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await systemLogin(mockUsername, mockPassword);

      expect(comparePassword).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      await expect(systemLogin(mockUsername, mockPassword)).rejects.toThrow(
        'Wrong Username or Password'
      );

      expect(comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error when password is invalid', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(systemLogin(mockUsername, mockPassword)).rejects.toThrow(
        'Wrong Username or Password'
      );
    });

    it('should handle errors from getUserByUsername', async () => {
      const userError = new Error('Database error');
      mockPrisma.user.findFirst.mockRejectedValue(userError);

      await expect(systemLogin(mockUsername, mockPassword)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getUserByUsername', () => {
    const mockUsername = 'testuser';
    const mockCleanedPhone = '+1234567890';

    beforeEach(() => {
      (cleanPhone as jest.Mock).mockReturnValue(mockCleanedPhone);
    });

    it('should find user by username', async () => {
      const mockUser = {
        id: 1,
        userName: mockUsername,
      };
      mockPrisma.user.findFirst.mockResolvedValue(mockUser);

      const result = await getUserByUsername(mockUsername);

      expect(cleanPhone).toHaveBeenCalledWith(mockUsername);
      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { userName: mockUsername },
            { phone: mockCleanedPhone },
            { email: mockUsername },
          ],
        },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const result = await getUserByUsername(mockUsername);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.user.findFirst.mockRejectedValue(dbError);

      await expect(getUserByUsername(mockUsername)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
}); 