import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';
import { Task, TaskStatus, TaskFilterParams } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;
  const apiUrl = 'http://localhost:8080/api/v1/tasks';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAllTasks', () => {
    it('should return an array of tasks', () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task 1',
          description: 'Description 1',
          status: TaskStatus.TODO,
          priority: 1,
          dueDate: '2025-12-31'
        },
        {
          id: '2',
          title: 'Test Task 2',
          description: 'Description 2',
          status: TaskStatus.IN_PROGRESS,
          priority: 2,
          dueDate: '2025-11-30'
        }
      ];

      service.getAllTasks().subscribe(tasks => {
        expect(tasks.length).toBe(2);
        expect(tasks).toEqual(mockTasks);
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);
    });

    it('should send correct query parameters for filters', () => {
      const filters: TaskFilterParams = {
        status: TaskStatus.TODO,
        priority: 1,
        search: 'test',
        sortBy: 'priority',
        sortDirection: 'asc'
      };

      service.getAllTasks(filters).subscribe();

      const req = httpMock.expectOne(request =>
        request.url === apiUrl &&
        request.params.has('status') &&
        request.params.has('priority') &&
        request.params.has('search') &&
        request.params.has('sortBy') &&
        request.params.has('sortDirection')
      );

      expect(req.request.params.get('status')).toBe('TODO');
      expect(req.request.params.get('priority')).toBe('1');
      expect(req.request.params.get('search')).toBe('test');
      expect(req.request.params.get('sortBy')).toBe('priority');
      expect(req.request.params.get('sortDirection')).toBe('asc');
      req.flush([]);
    });

    it('should handle date range filters', () => {
      const filters: TaskFilterParams = {
        dueDateFrom: '2025-01-01',
        dueDateTo: '2025-12-31'
      };

      service.getAllTasks(filters).subscribe();

      const req = httpMock.expectOne(request =>
        request.url === apiUrl &&
        request.params.has('dueDateFrom') &&
        request.params.has('dueDateTo')
      );

      expect(req.request.params.get('dueDateFrom')).toBe('2025-01-01');
      expect(req.request.params.get('dueDateTo')).toBe('2025-12-31');
      req.flush([]);
    });
  });

  describe('getTaskById', () => {
    it('should return a single task', () => {
      const mockTask: Task = {
        id: '1',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: 1,
        dueDate: '2025-12-31'
      };

      service.getTaskById('1').subscribe(task => {
        expect(task).toEqual(mockTask);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockTask);
    });
  });

  describe('createTask', () => {
    it('should create a new task', () => {
      const newTask: Task = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: 3
      };

      const createdTask: Task = {
        ...newTask,
        id: '123',
        createdAt: '2025-10-04T10:00:00Z'
      };

      service.createTask(newTask).subscribe(task => {
        expect(task.id).toBe('123');
        expect(task.title).toBe('New Task');
      });

      const req = httpMock.expectOne(apiUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(newTask);
      req.flush(createdTask);
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', () => {
      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.DONE,
        priority: 1,
        dueDate: '2025-12-31'
      };

      service.updateTask('1', updatedTask).subscribe(task => {
        expect(task.title).toBe('Updated Task');
        expect(task.status).toBe(TaskStatus.DONE);
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updatedTask);
      req.flush(updatedTask);
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', () => {
      service.deleteTask('1').subscribe(response => {
        expect(response).toBeUndefined();
      });

      const req = httpMock.expectOne(`${apiUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('Error Handling', () => {
    it('should handle error when fetching tasks fails', () => {
      const errorMessage = 'Failed to load tasks';

      service.getAllTasks().subscribe({
        next: () => fail('should have failed with 500 error'),
        error: (error) => {
          expect(error.status).toBe(500);
        }
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
    });

    it('should handle 404 error when task not found', () => {
      service.getTaskById('invalid-id').subscribe({
        next: () => fail('should have failed with 404 error'),
        error: (error) => {
          expect(error.status).toBe(404);
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/invalid-id`);
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });
  });
});

