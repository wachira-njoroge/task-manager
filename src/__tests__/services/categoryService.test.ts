// Mock Prisma client at the very top
const mockPrisma = {
  category: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
};
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

import { createCategory, getCategoryByName, getAllCategories } from '../../services/categoryService';

describe('CategoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    const mockCategoryPayload = {
      name: 'Work',
    };

    const mockCreatedCategory = {
      id: 1,
      name: mockCategoryPayload.name,
    };

    it('should create a category successfully', async () => {
      // Mock getCategoryByName to return null (category doesn't exist)
      mockPrisma.category.findUnique.mockResolvedValue(null);
      
      // Mock successful category creation
      mockPrisma.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await createCategory(mockCategoryPayload);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: mockCategoryPayload.name },
      });
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: { name: mockCategoryPayload.name },
      });
      expect(result).toEqual(mockCreatedCategory);
    });

    it('should throw error when category already exists', async () => {
      // Mock getCategoryByName to return existing category
      mockPrisma.category.findUnique.mockResolvedValue(mockCreatedCategory);

      await expect(createCategory(mockCategoryPayload)).rejects.toThrow(
        'Category already exists'
      );

      expect(mockPrisma.category.create).not.toHaveBeenCalled();
    });

    it('should handle database errors during category check', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.category.findUnique.mockRejectedValue(dbError);

      await expect(createCategory(mockCategoryPayload)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle database errors during category creation', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);
      
      const dbError = new Error('Database connection failed');
      mockPrisma.category.create.mockRejectedValue(dbError);

      await expect(createCategory(mockCategoryPayload)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should create category with different name', async () => {
      const differentCategoryPayload = {
        name: 'Personal',
      };

      const differentCreatedCategory = {
        id: 2,
        name: differentCategoryPayload.name,
      };

      mockPrisma.category.findUnique.mockResolvedValue(null);
      mockPrisma.category.create.mockResolvedValue(differentCreatedCategory);

      const result = await createCategory(differentCategoryPayload);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: differentCategoryPayload.name },
      });
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: { name: differentCategoryPayload.name },
      });
      expect(result).toEqual(differentCreatedCategory);
    });
  });

  describe('getCategoryByName', () => {
    const mockCategoryName = 'Work';
    const mockCategory = {
      id: 1,
      name: mockCategoryName,
    };

    it('should find category by name successfully', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await getCategoryByName(mockCategoryName);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: mockCategoryName },
      });
      expect(result).toEqual(mockCategory);
    });

    it('should return null when category not found', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(null);

      const result = await getCategoryByName(mockCategoryName);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.category.findUnique.mockRejectedValue(dbError);

      await expect(getCategoryByName(mockCategoryName)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should find category with different name', async () => {
      const differentCategoryName = 'Personal';
      const differentCategory = {
        id: 2,
        name: differentCategoryName,
      };

      mockPrisma.category.findUnique.mockResolvedValue(differentCategory);

      const result = await getCategoryByName(differentCategoryName);

      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { name: differentCategoryName },
      });
      expect(result).toEqual(differentCategory);
    });
  });

  describe('getAllCategories', () => {
    const mockCategories = [
      { id: 1, name: 'Work' },
      { id: 2, name: 'Personal' },
      { id: 3, name: 'Shopping' },
    ];

    it('should get all categories successfully', async () => {
      mockPrisma.category.findMany.mockResolvedValue(mockCategories);

      const result = await getAllCategories();

      expect(mockPrisma.category.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockCategories);
    });

    it('should return empty array when no categories exist', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      const result = await getAllCategories();

      expect(result).toEqual([]);
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.category.findMany.mockRejectedValue(dbError);

      await expect(getAllCategories()).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should return single category when only one exists', async () => {
      const singleCategory = [{ id: 1, name: 'Work' }];
      mockPrisma.category.findMany.mockResolvedValue(singleCategory);

      const result = await getAllCategories();

      expect(result).toEqual(singleCategory);
    });
  });
}); 