import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskListComponent } from './components/task-list/task-list.component';
import { TaskService } from './services/task.service';
import { Task, TaskStatus } from './models/task.model';
import { FormsModule } from '@angular/forms';

describe('Task Management Integration Tests', () => {
  let httpMock: HttpTestingController;
  let taskService: TaskService;
  const apiUrl = 'http://localhost:8080/api/v1/tasks';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        TaskListComponent
      ],
      providers: [TaskService]
    }).compileComponents();

    taskService = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('End-to-End Task Workflow', () => {
    it('should complete full CRUD cycle', () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Initial Task',
          description: 'Initial Description',
          status: TaskStatus.TODO,
          priority: 3,
          dueDate: '2025-12-31'
        }
      ];

      // 1. Get all tasks (initial load)
      taskService.getAllTasks().subscribe(tasks => {
        expect(tasks.length).toBe(1);
        expect(tasks[0].title).toBe('Initial Task');
      });
      httpMock.expectOne(apiUrl).flush(mockTasks);

      // 2. Create new task
      const newTask: Task = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: 1
      };

      const createdTask = { ...newTask, id: '2', createdAt: '2025-10-04T10:00:00Z' };
      taskService.createTask(newTask).subscribe(task => {
        expect(task.id).toBe('2');
      });
      httpMock.expectOne(apiUrl).flush(createdTask);

      // 3. Update the task
      const updatedTask = { ...createdTask, status: TaskStatus.DONE };
      taskService.updateTask('2', updatedTask).subscribe(task => {
        expect(task.status).toBe(TaskStatus.DONE);
      });
      httpMock.expectOne(`${apiUrl}/2`).flush(updatedTask);

      // 4. Get updated task by ID
      taskService.getTaskById('2').subscribe(task => {
        expect(task.status).toBe(TaskStatus.DONE);
      });
      httpMock.expectOne(`${apiUrl}/2`).flush(updatedTask);

      // 5. Delete the task
      taskService.deleteTask('2').subscribe();
      httpMock.expectOne(`${apiUrl}/2`).flush(null);

      // 6. Verify task list updated
      taskService.getAllTasks().subscribe(tasks => {
        expect(tasks.length).toBe(1); // Back to original
      });
      httpMock.expectOne(apiUrl).flush(mockTasks);
    });
  });

  describe('Component-Service Integration', () => {
    let fixture: any;
    let component: TaskListComponent;

    beforeEach(() => {
      fixture = TestBed.createComponent(TaskListComponent);
      component = fixture.componentInstance;
    });

    it('should load tasks through service on component init', () => {
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Test Task',
          description: 'Test Description',
          status: TaskStatus.TODO,
          priority: 1,
          dueDate: '2025-12-31'
        }
      ];

      fixture.detectChanges(); // Triggers ngOnInit

      const req = httpMock.expectOne(request =>
        request.url === apiUrl &&
        request.params.get('sortBy') === 'priority' &&
        request.params.get('sortDirection') === 'asc'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockTasks);

      expect(component.tasks.length).toBe(1);
      expect(component.loading).toBe(false);
    });

    it('should handle filter changes through service', () => {
      component.filterStatus = 'TODO';
      component.filterPriority = '1';

      fixture.detectChanges();

      // Clear initial request
      httpMock.expectOne(request => request.url === apiUrl).flush([]);

      component.applyFilters();

      const req = httpMock.expectOne(request =>
        request.url === apiUrl &&
        request.params.get('status') === 'TODO' &&
        request.params.get('priority') === '1'
      );

      req.flush([]);
    });

    it('should create task through service and reload list', () => {
      const newTask: Task = {
        title: 'Integration Test Task',
        description: 'Integration Test Description',
        status: TaskStatus.TODO,
        priority: 2
      };

      fixture.detectChanges();

      // Clear initial load request
      httpMock.expectOne(request => request.url === apiUrl).flush([]);

      component.currentTask = newTask;
      component.isEditMode = false;

      component.saveTask();

      // Expect create request
      const createReq = httpMock.expectOne(request =>
        request.url === apiUrl && request.method === 'POST'
      );
      createReq.flush({ ...newTask, id: '123' });

      // Expect reload request
      const reloadReq = httpMock.expectOne(request => request.url === apiUrl);
      expect(reloadReq.request.method).toBe('GET');
      reloadReq.flush([{ ...newTask, id: '123' }]);

      expect(component.showModal).toBe(false);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle service errors in component', () => {
      const fixture = TestBed.createComponent(TaskListComponent);
      const component = fixture.componentInstance;

      fixture.detectChanges();

      const req = httpMock.expectOne(request => request.url === apiUrl);
      req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(component.error).toBeTruthy();
      expect(component.loading).toBe(false);
    });

    it('should handle network timeout', () => {
      const fixture = TestBed.createComponent(TaskListComponent);
      const component = fixture.componentInstance;

      fixture.detectChanges();

      const req = httpMock.expectOne(request => request.url === apiUrl);
      req.error(new ErrorEvent('Network error', {
        message: 'Connection timeout'
      }));

      expect(component.error).toBeTruthy();
    });
  });

  describe('Filter and Search Integration', () => {
    it('should combine multiple filters correctly', () => {
      const filters = {
        status: TaskStatus.IN_PROGRESS,
        priority: 1,
        search: 'urgent',
        dueDateFrom: '2025-10-01',
        dueDateTo: '2025-12-31',
        sortBy: 'priority',
        sortDirection: 'asc' as const
      };

      taskService.getAllTasks(filters).subscribe();

      const req = httpMock.expectOne(request => {
        const params = request.params;
        return request.url === apiUrl &&
          params.get('status') === 'IN_PROGRESS' &&
          params.get('priority') === '1' &&
          params.get('search') === 'urgent' &&
          params.get('dueDateFrom') === '2025-10-01' &&
          params.get('dueDateTo') === '2025-12-31' &&
          params.get('sortBy') === 'priority' &&
          params.get('sortDirection') === 'asc';
      });

      req.flush([]);
    });
  });

  describe('Data Flow Integration', () => {
    it('should maintain data consistency across operations', () => {
      const initialTasks: Task[] = [
        {
          id: '1',
          title: 'Task 1',
          description: 'Description 1',
          status: TaskStatus.TODO,
          priority: 1
        }
      ];

      // Load initial tasks
      taskService.getAllTasks().subscribe();
      httpMock.expectOne(apiUrl).flush(initialTasks);

      // Update task
      const updated = { ...initialTasks[0], status: TaskStatus.DONE };
      taskService.updateTask('1', updated).subscribe();
      httpMock.expectOne(`${apiUrl}/1`).flush(updated);

      // Verify updated task
      taskService.getTaskById('1').subscribe(task => {
        expect(task.status).toBe(TaskStatus.DONE);
      });
      httpMock.expectOne(`${apiUrl}/1`).flush(updated);
    });
  });

  describe('Performance Tests', () => {
    it('should handle large number of tasks efficiently', () => {
      const largeTasks: Task[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Task ${i + 1}`,
        description: `Description ${i + 1}`,
        status: i % 3 === 0 ? TaskStatus.TODO : i % 3 === 1 ? TaskStatus.IN_PROGRESS : TaskStatus.DONE,
        priority: (i % 5) + 1
      }));

      taskService.getAllTasks().subscribe(tasks => {
        expect(tasks.length).toBe(100);
      });

      const req = httpMock.expectOne(apiUrl);
      req.flush(largeTasks);
    });
  });
});

