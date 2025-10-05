import { Task, TaskStatus, TaskFilterParams } from './task.model';

describe('Task Model', () => {
  describe('Task Interface', () => {
    it('should create a valid task object', () => {
      const task: Task = {
        id: '123',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: 3,
        dueDate: '2025-12-31',
        createdAt: '2025-10-04T10:00:00Z',
        updatedAt: '2025-10-04T10:00:00Z'
      };

      expect(task.id).toBe('123');
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('Test Description');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(3);
      expect(task.dueDate).toBe('2025-12-31');
    });

    it('should create a task without optional fields', () => {
      const task: Task = {
        title: 'Minimal Task',
        description: 'Minimal Description',
        status: TaskStatus.TODO,
        priority: 1
      };

      expect(task.id).toBeUndefined();
      expect(task.dueDate).toBeUndefined();
      expect(task.createdAt).toBeUndefined();
      expect(task.updatedAt).toBeUndefined();
    });

    it('should enforce priority range conceptually', () => {
      const validPriorities = [1, 2, 3, 4, 5];

      validPriorities.forEach(priority => {
        const task: Task = {
          title: 'Test',
          description: 'Test',
          status: TaskStatus.TODO,
          priority: priority
        };

        expect(task.priority).toBeGreaterThanOrEqual(1);
        expect(task.priority).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('TaskStatus Enum', () => {
    it('should have correct TODO status', () => {
      expect(TaskStatus.TODO).toBe('TODO');
    });

    it('should have correct IN_PROGRESS status', () => {
      expect(TaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
    });

    it('should have correct DONE status', () => {
      expect(TaskStatus.DONE).toBe('DONE');
    });

    it('should allow status assignment', () => {
      const task: Task = {
        title: 'Test',
        description: 'Test',
        status: TaskStatus.TODO,
        priority: 1
      };

      expect(task.status).toBe(TaskStatus.TODO);

      task.status = TaskStatus.IN_PROGRESS;
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);

      task.status = TaskStatus.DONE;
      expect(task.status).toBe(TaskStatus.DONE);
    });
  });

  describe('TaskFilterParams Interface', () => {
    it('should create empty filter params', () => {
      const filters: TaskFilterParams = {};

      expect(filters.status).toBeUndefined();
      expect(filters.priority).toBeUndefined();
      expect(filters.search).toBeUndefined();
    });

    it('should create filter params with status', () => {
      const filters: TaskFilterParams = {
        status: TaskStatus.TODO
      };

      expect(filters.status).toBe(TaskStatus.TODO);
    });

    it('should create filter params with priority', () => {
      const filters: TaskFilterParams = {
        priority: 1
      };

      expect(filters.priority).toBe(1);
    });

    it('should create filter params with date range', () => {
      const filters: TaskFilterParams = {
        dueDateFrom: '2025-01-01',
        dueDateTo: '2025-12-31'
      };

      expect(filters.dueDateFrom).toBe('2025-01-01');
      expect(filters.dueDateTo).toBe('2025-12-31');
    });

    it('should create filter params with search query', () => {
      const filters: TaskFilterParams = {
        search: 'test query'
      };

      expect(filters.search).toBe('test query');
    });

    it('should create filter params with sorting', () => {
      const filters: TaskFilterParams = {
        sortBy: 'priority',
        sortDirection: 'asc'
      };

      expect(filters.sortBy).toBe('priority');
      expect(filters.sortDirection).toBe('asc');
    });

    it('should create comprehensive filter params', () => {
      const filters: TaskFilterParams = {
        status: TaskStatus.IN_PROGRESS,
        priority: 2,
        dueDateFrom: '2025-10-01',
        dueDateTo: '2025-12-31',
        search: 'urgent',
        sortBy: 'dueDate',
        sortDirection: 'desc'
      };

      expect(filters.status).toBe(TaskStatus.IN_PROGRESS);
      expect(filters.priority).toBe(2);
      expect(filters.dueDateFrom).toBe('2025-10-01');
      expect(filters.dueDateTo).toBe('2025-12-31');
      expect(filters.search).toBe('urgent');
      expect(filters.sortBy).toBe('dueDate');
      expect(filters.sortDirection).toBe('desc');
    });
  });

  describe('Type Safety', () => {
    it('should enforce TaskStatus enum values', () => {
      const statuses: TaskStatus[] = [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE
      ];

      expect(statuses.length).toBe(3);
      expect(statuses).toContain(TaskStatus.TODO);
      expect(statuses).toContain(TaskStatus.IN_PROGRESS);
      expect(statuses).toContain(TaskStatus.DONE);
    });

    it('should allow valid sort directions', () => {
      const directions: ('asc' | 'desc')[] = ['asc', 'desc'];

      directions.forEach(direction => {
        const filters: TaskFilterParams = {
          sortDirection: direction
        };
        expect(filters.sortDirection).toBe(direction);
      });
    });
  });
});

