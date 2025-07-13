// Jest setup file - this file is for configuration only, not tests

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

// Mock utility functions
jest.mock('../utils/hashPassword', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.mock('../utils/cleanPhone', () => jest.fn()); 