import { Test, TestingModule } from '@nestjs/testing';
import { ParentService } from './parent.service';
import { DATABASE_CONNECTION } from 'src/core/database-connection';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

describe('ParentService', () => {
  let service: ParentService;
  let mockDatabase: any;

  const mockParent = {
    parentId: 1,
    // Add other parent fields as needed
  };

  const mockChild = {
    childId: 101,
    parentId: 1,
    firstName: 'Test',
    lastName: 'Child',
    username: 'testchild',
    password: 'hashedpassword',
    dateOfBirth: new Date('2015-01-01'),
    gradeLevelId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createMockDatabase = () => ({
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([mockParent]),
  });

  beforeEach(async () => {
    mockDatabase = createMockDatabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParentService,
        {
          provide: DATABASE_CONNECTION,
          useValue: mockDatabase,
        },
      ],
    }).compile();

    service = module.get<ParentService>(ParentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createParentRecord', () => {
    it('should create a parent record successfully', async () => {
      // Mock user exists
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([{ userId: 1 }]); // User exists
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([]); // Parent doesn't exist yet
      mockDatabase.insert.mockReturnThis();
      mockDatabase.values.mockReturnThis();
      mockDatabase.returning.mockResolvedValueOnce([{ parentId: 1 }]); // Created successfully

      const result = await service.createParentRecord(1);
      expect(result).toBe(true);
    });

    it('should return true if parent record already exists', async () => {
      // Mock user and parent exist
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([{ userId: 1 }]); // User exists
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([{ parentId: 1 }]); // Parent already exists

      const result = await service.createParentRecord(1);
      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      // Mock user doesn't exist
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([]); // User doesn't exist

      const result = await service.createParentRecord(999);
      expect(result).toBe(false);
    });
  });

  describe('verifyParentChild', () => {
    it('should return true if child belongs to parent', async () => {
      // Mock parent exists
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([mockParent]); // Parent exists

      // Mock child exists and belongs to parent
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([mockChild]); // Child exists and has parentId=1

      const result = await service.verifyParentChild(1, 101);
      expect(result).toBe(true);
    });

    it('should return false if child belongs to a different parent', async () => {
      // Mock parent exists
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([mockParent]); // Parent exists

      // Mock child exists but belongs to different parent
      const differentParentChild = { ...mockChild, parentId: 2 };
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([differentParentChild]); // Child exists but has parentId=2

      const result = await service.verifyParentChild(1, 101);
      expect(result).toBe(false);
    });

    it('should throw NotFoundException if child does not exist', async () => {
      // Mock parent exists
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([mockParent]); // Parent exists

      // Mock child doesn't exist
      mockDatabase.select.mockReturnThis();
      mockDatabase.from.mockReturnThis();
      mockDatabase.where.mockResolvedValueOnce([]); // Child doesn't exist

      await expect(service.verifyParentChild(1, 999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateChildInfo', () => {
    it('should update child info successfully', async () => {
      // Mock verify parent-child relationship (returns true)
      jest.spyOn(service, 'verifyParentChild').mockResolvedValueOnce(true);

      // Mock update operation
      const updatedChild = { ...mockChild, firstName: 'Updated' };
      mockDatabase.update.mockReturnThis();
      mockDatabase.set.mockReturnThis();
      mockDatabase.where.mockReturnThis();
      mockDatabase.returning.mockResolvedValueOnce([updatedChild]);

      const updateData = { firstName: 'Updated' };
      const result = await service.updateChildInfo(1, 101, updateData);

      // Verify password is removed from result
      const { password, ...expectedResult } = updatedChild;
      expect(result).toEqual(expectedResult);
    });

    it('should throw UnauthorizedException if child does not belong to parent', async () => {
      // Mock verify parent-child relationship (returns false)
      jest.spyOn(service, 'verifyParentChild').mockResolvedValueOnce(false);

      const updateData = { firstName: 'Updated' };
      await expect(service.updateChildInfo(1, 101, updateData)).rejects.toThrow(UnauthorizedException);
    });
  });

  // Additional tests for other methods can be added following the same pattern
}); 