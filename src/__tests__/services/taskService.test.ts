// Mock Prisma client at the very top
const mockPrisma = {
  task: {
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
  TaskStatus: {
    pending: 'pending',
    in_progress: 'in_progress',
    completed: 'completed',
    cancelled: 'cancelled',
  },
}));

import { createTask, updateTaskDetails, getTaskByCode, getAllTasks } from '../../services/taskService';
import { getCategoryByName } from '../../services/categoryService';
import { getUserByUsername } from '../../services/userService';

// Mock service dependencies
jest.mock('../../services/categoryService');
jest.mock('../../services/userService');


describe('TaskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    const mockTaskPayload = {
      description: 'Test task description',
      dueDate: '2024-12-31',
      status: 'pending',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      category: 'Work',
    };

    const mockLoggedInUser = 'testuser';
    const mockUser = { id: 1, userName: mockLoggedInUser };
    const mockCategory = { id: 1, name: 'Work' };
    const mockCreatedTask = {
      id: 1,
      code: 'TSK-1234',
      description: mockTaskPayload.description,
      dueDate: new Date(mockTaskPayload.dueDate),
      status: 'pending',
      categoryId: mockCategory.id,
      userId: mockUser.id,
    };

    beforeEach(() => {
      (getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
      (getCategoryByName as jest.Mock).mockResolvedValue(mockCategory);
    });

    it('should create a task successfully', async () => {
      mockPrisma.task.create.mockResolvedValue(mockCreatedTask);

      const result = await createTask(mockTaskPayload, mockLoggedInUser);

      expect(getUserByUsername).toHaveBeenCalledWith(mockLoggedInUser);
      expect(getCategoryByName).toHaveBeenCalledWith(mockTaskPayload.category);
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: {
          code: expect.stringMatching(/^TSK-\d{4}$/),
          status: 'pending',
          description: mockTaskPayload.description,
          dueDate: new Date(mockTaskPayload.dueDate),
          categoryId: mockCategory.id,
          userId: mockUser.id,
        },
      });
      expect(result).toEqual(mockCreatedTask);
    });

    it('should throw error when user not found', async () => {
      (getUserByUsername as jest.Mock).mockResolvedValue(null);

      await expect(createTask(mockTaskPayload, mockLoggedInUser)).rejects.toThrow();
    });

    it('should throw error when category not found', async () => {
      (getCategoryByName as jest.Mock).mockResolvedValue(null);

      await expect(createTask(mockTaskPayload, mockLoggedInUser)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.task.create.mockRejectedValue(dbError);

      await expect(createTask(mockTaskPayload, mockLoggedInUser)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('updateTaskDetails', () => {
    const mockTaskPayload = {
      description: 'Updated task description',
      dueDate: '2024-12-31',
      status: 'in_progress',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      category: 'Personal',
    };

    const mockTaskCode = 'TSK-1234';
    const mockExistingTask = {
      id: 1,
      code: mockTaskCode,
      description: 'Original description',
      dueDate: new Date('2024-06-01'),
      status: 'pending',
    };

    const mockCategory = { id: 2, name: 'Personal' };

    beforeEach(() => {
      (getCategoryByName as jest.Mock).mockResolvedValue(mockCategory);
    });

    it('should start a task successfully', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);
      
      const mockUpdatedTask = {
        ...mockExistingTask,
        startDate: new Date(mockTaskPayload.startDate),
        status: 'in_progress',
        categoryId: mockCategory.id,
      };
      mockPrisma.task.update.mockResolvedValue(mockUpdatedTask);

      const result = await updateTaskDetails(mockTaskPayload, 'start', mockTaskCode);

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { code: mockTaskCode },
      });
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: mockExistingTask.id },
        data: {
          startDate: new Date(mockTaskPayload.startDate),
          status: 'in_progress',
          categoryId: mockCategory.id,
        },
      });
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should complete a task successfully', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);
      
      const mockUpdatedTask = {
        ...mockExistingTask,
        endDate: new Date(mockTaskPayload.endDate),
        status: 'completed',
        categoryId: mockCategory.id,
      };
      mockPrisma.task.update.mockResolvedValue(mockUpdatedTask);

      const result = await updateTaskDetails(mockTaskPayload, 'complete', mockTaskCode);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: mockExistingTask.id },
        data: {
          endDate: new Date(mockTaskPayload.endDate),
          status: 'completed',
          categoryId: mockCategory.id,
        },
      });
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should cancel a task successfully', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);
      
      const mockUpdatedTask = {
        ...mockExistingTask,
        status: 'cancelled',
        categoryId: mockCategory.id,
      };
      mockPrisma.task.update.mockResolvedValue(mockUpdatedTask);

      const result = await updateTaskDetails(mockTaskPayload, 'cancel', mockTaskCode);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: mockExistingTask.id },
        data: {
          status: 'cancelled',
          categoryId: mockCategory.id,
        },
      });
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should update task details successfully', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);
      
      const mockUpdatedTask = {
        ...mockExistingTask,
        description: mockTaskPayload.description,
        dueDate: new Date(mockTaskPayload.dueDate),
        categoryId: mockCategory.id,
      };
      mockPrisma.task.update.mockResolvedValue(mockUpdatedTask);

      const result = await updateTaskDetails(mockTaskPayload, 'details', mockTaskCode);

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: mockExistingTask.id },
        data: {
          description: mockTaskPayload.description,
          dueDate: new Date(mockTaskPayload.dueDate),
          categoryId: mockCategory.id,
        },
      });
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should update task with category change', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);
      
      const mockUpdatedTask = {
        ...mockExistingTask,
        categoryId: mockCategory.id,
      };
      mockPrisma.task.update.mockResolvedValue(mockUpdatedTask);

      const result = await updateTaskDetails(mockTaskPayload, 'details', mockTaskCode);

      expect(getCategoryByName).toHaveBeenCalledWith(mockTaskPayload.category);
      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: mockExistingTask.id },
        data: {
          description: mockTaskPayload.description,
          dueDate: new Date(mockTaskPayload.dueDate),
          categoryId: mockCategory.id,
        },
      });
      expect(result).toEqual(mockUpdatedTask);
    });

    it('should throw error when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      await expect(updateTaskDetails(mockTaskPayload, 'start', mockTaskCode)).rejects.toThrow(
        'Invalid'
      );
    });

    it('should throw error when category not found during update', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);
      (getCategoryByName as jest.Mock).mockResolvedValue(null);

      await expect(updateTaskDetails(mockTaskPayload, 'details', mockTaskCode)).rejects.toThrow(
        'Invalid Category provided'
      );
    });

    it('should return undefined for invalid action', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockExistingTask);

      const result = await updateTaskDetails(mockTaskPayload, 'invalid', mockTaskCode);

      expect(result).toBeUndefined();
      expect(mockPrisma.task.update).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.task.findUnique.mockRejectedValue(dbError);

      await expect(updateTaskDetails(mockTaskPayload, 'start', mockTaskCode)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getTaskByCode', () => {
    const mockTaskCode = 'TSK-1234';
    const mockTask = {
      id: 1,
      code: mockTaskCode,
      description: 'Test task',
      status: 'pending',
    };

    it('should find task by code successfully', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);

      const result = await getTaskByCode(mockTaskCode);

      expect(mockPrisma.task.findUnique).toHaveBeenCalledWith({
        where: { code: mockTaskCode },
      });
      expect(result).toEqual(mockTask);
    });

    it('should return null when task not found', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);

      const result = await getTaskByCode(mockTaskCode);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.task.findUnique.mockRejectedValue(dbError);

      await expect(getTaskByCode(mockTaskCode)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });

  describe('getAllTasks', () => {
    const mockLoggedInUser = 'testuser';
    const mockUser = { id: 1, userName: mockLoggedInUser };
    const mockTasks = [
      {
        id: 1,
        code: 'TSK-1234',
        description: 'Task 1',
        status: 'pending',
        category: { name: 'Work' },
      },
      {
        id: 2,
        code: 'TSK-5678',
        description: 'Task 2',
        status: 'completed',
        category: { name: 'Personal' },
      },
    ];

    beforeEach(() => {
      (getUserByUsername as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should get all tasks for user successfully', async () => {
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);
      mockPrisma.task.count.mockResolvedValue(2);

      const result = await getAllTasks(mockLoggedInUser, 1, 10);

      expect(getUserByUsername).toHaveBeenCalledWith(mockLoggedInUser);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          NOT: { status: 'cancelled' },
          userId: mockUser.id,
        },
        skip: 0,
        take: 10,
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(mockPrisma.task.count).toHaveBeenCalledWith({
        where: {
          NOT: { status: 'cancelled' },
          userId: mockUser.id,
        },
      });
      expect(result).toEqual({
        tasks: mockTasks,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalTasks: 2,
          tasksPerPage: 10,
        },
      });
    });

    it('should filter tasks by category', async () => {
      const categorySearch = 'Work';
      mockPrisma.task.findMany.mockResolvedValue([mockTasks[0]]);
      mockPrisma.task.count.mockResolvedValue(1);

      await getAllTasks(mockLoggedInUser, 1, 10, undefined, undefined, categorySearch);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          NOT: { status: 'cancelled' },
          userId: mockUser.id,
          OR: [
            {
              category: {
                name: categorySearch.toLocaleLowerCase(),
              },
            },
          ],
        },
        skip: 0,
        take: 10,
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter tasks by date range', async () => {
      const startDate = '2024-01-01';
      const endDate = '2024-12-31';
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);
      mockPrisma.task.count.mockResolvedValue(2);

      await getAllTasks(mockLoggedInUser, 1, 10, startDate, endDate);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          NOT: { status: 'cancelled' },
          userId: mockUser.id,
          createdAt: {
            gte: new Date(`${startDate}T00:00:00.000Z`),
            lte: new Date(`${endDate}T23:59:59.999Z`),
          },
        },
        skip: 0,
        take: 10,
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should throw error for invalid date format', async () => {
      const startDate = 'invalid-date';
      const endDate = '2024-12-31';

      await expect(getAllTasks(mockLoggedInUser, 1, 10, startDate, endDate)).rejects.toThrow(
        'Invalid date format provided'
      );
    });

    it('should throw error when start date is after end date', async () => {
      const startDate = '2024-12-31';
      const endDate = '2024-01-01';

      await expect(getAllTasks(mockLoggedInUser, 1, 10, startDate, endDate)).rejects.toThrow(
        'Start date cannot be later than end date'
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.task.findMany.mockResolvedValue(mockTasks);
      mockPrisma.task.count.mockResolvedValue(25);

      const result = await getAllTasks(mockLoggedInUser, 2, 10);

      expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
        where: {
          NOT: { status: 'cancelled' },
          userId: mockUser.id,
        },
        skip: 10,
        take: 10,
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result.pagination).toEqual({
        currentPage: 2,
        totalPages: 3,
        totalTasks: 25,
        tasksPerPage: 10,
      });
    });

    it('should throw error when user not found', async () => {
      (getUserByUsername as jest.Mock).mockResolvedValue(null);
      mockPrisma.task.findMany.mockResolvedValue([]);
      mockPrisma.task.count.mockResolvedValue(0);

      const result = await getAllTasks(mockLoggedInUser, 1, 10);
      expect(result).toEqual({ tasks: [], pagination: { currentPage: 1, totalPages: 0, totalTasks: 0, tasksPerPage: 10 } });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockPrisma.task.findMany.mockRejectedValue(dbError);

      await expect(getAllTasks(mockLoggedInUser, 1, 10)).rejects.toThrow(
        'Database connection failed'
      );
    });
  });
}); 