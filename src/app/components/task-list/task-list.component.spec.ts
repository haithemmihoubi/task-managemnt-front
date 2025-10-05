import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { TaskService } from '../../services/task.service';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Task, TaskStatus } from '../../models/task.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Test Task 1',
      description: 'Description 1',
      status: TaskStatus.TODO,
      priority: 1,
      dueDate: '2025-12-31',
      createdAt: '2025-10-01T10:00:00Z'
    },
    {
      id: '2',
      title: 'Test Task 2',
      description: 'Description 2',
      status: TaskStatus.IN_PROGRESS,
      priority: 2,
      dueDate: '2025-11-30',
      createdAt: '2025-10-02T10:00:00Z'
    },
    {
      id: '3',
      title: 'Test Task 3',
      description: 'Description 3',
      status: TaskStatus.DONE,
      priority: 3,
      dueDate: '2025-10-15',
      createdAt: '2025-10-03T10:00:00Z'
    }
  ];

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'getAllTasks',
      'getTaskById',
      'createTask',
      'updateTask',
      'deleteTask'
    ]);

    mockTaskService.getAllTasks.and.returnValue(of(mockTasks));

    await TestBed.configureTestingModule({
      imports: [TaskListComponent, FormsModule],
      providers: [
        { provide: TaskService, useValue: mockTaskService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load tasks on init', () => {
      fixture.detectChanges();
      expect(mockTaskService.getAllTasks).toHaveBeenCalled();
      expect(component.tasks.length).toBe(3);
      expect(component.filteredTasks.length).toBe(3);
      expect(component.loading).toBe(false);
    });

    it('should handle error when loading tasks', () => {
      mockTaskService.getAllTasks.and.returnValue(
        throwError(() => new Error('Network error'))
      );

      fixture.detectChanges();

      expect(component.error).toBe('Failed to load tasks. Please try again.');
      expect(component.loading).toBe(false);
    });
  });

  describe('Filter Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should build filter params correctly', () => {
      component.filterStatus = 'TODO';
      component.filterPriority = '1';
      component.searchQuery = 'test';
      component.sortBy = 'priority';
      component.sortDirection = 'asc';

      const filters = component.buildFilterParams();

      expect(filters.status).toBe(TaskStatus.TODO);
      expect(filters.priority).toBe(1);
      expect(filters.search).toBe('test');
      expect(filters.sortBy).toBe('priority');
      expect(filters.sortDirection).toBe('asc');
    });

    it('should apply filters', () => {
      component.filterStatus = 'TODO';
      component.applyFilters();

      expect(mockTaskService.getAllTasks).toHaveBeenCalledTimes(2); // once on init, once on apply
    });

    it('should clear filters', () => {
      component.filterStatus = 'TODO';
      component.filterPriority = '1';
      component.searchQuery = 'test';
      component.dueDateFrom = '2025-01-01';
      component.dueDateTo = '2025-12-31';

      component.clearFilters();

      expect(component.filterStatus).toBe('');
      expect(component.filterPriority).toBe('');
      expect(component.searchQuery).toBe('');
      expect(component.dueDateFrom).toBe('');
      expect(component.dueDateTo).toBe('');
      expect(component.sortBy).toBe('priority');
      expect(component.sortDirection).toBe('asc');
    });
  });

  describe('CRUD Operations', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should open create modal', () => {
      component.openCreateModal();

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(false);
      expect(component.currentTask.title).toBe('');
    });

    it('should open edit modal with task data', () => {
      const task = mockTasks[0];
      component.openEditModal(task);

      expect(component.showModal).toBe(true);
      expect(component.isEditMode).toBe(true);
      expect(component.currentTask.title).toBe(task.title);
      expect(component.currentTask.id).toBe(task.id);
    });

    it('should close modal', () => {
      component.showModal = true;
      component.currentTask.title = 'Test';

      component.closeModal();

      expect(component.showModal).toBe(false);
      expect(component.currentTask.title).toBe('');
    });

    it('should create a new task', () => {
      const newTask: Task = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
        priority: 3
      };

      const createdTask = { ...newTask, id: '4' };
      mockTaskService.createTask.and.returnValue(of(createdTask));
      mockTaskService.getAllTasks.and.returnValue(of([...mockTasks, createdTask]));

      component.currentTask = newTask;
      component.isEditMode = false;
      component.saveTask();

      expect(mockTaskService.createTask).toHaveBeenCalledWith(newTask);
    });

    it('should update an existing task', () => {
      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.DONE,
        priority: 1
      };

      mockTaskService.updateTask.and.returnValue(of(updatedTask));

      component.currentTask = updatedTask;
      component.isEditMode = true;
      component.saveTask();

      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', updatedTask);
    });

    it('should delete a task', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockTaskService.deleteTask.and.returnValue(of(undefined));

      component.deleteTask('1');

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1');
    });

    it('should not delete task if user cancels', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      component.deleteTask('1');

      expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
    });
  });

  describe('Task Details', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should view task details', () => {
      const task = mockTasks[0];
      component.viewTaskDetails(task);

      expect(component.showDetailsModal).toBe(true);
      expect(component.selectedTask).toBe(task);
    });

    it('should close details modal', () => {
      component.selectedTask = mockTasks[0];
      component.showDetailsModal = true;

      component.closeDetailsModal();

      expect(component.showDetailsModal).toBe(false);
      expect(component.selectedTask).toBeNull();
    });
  });

  describe('Validation', () => {
    beforeEach(() => {
      fixture.detectChanges();
      spyOn(window, 'alert');
    });

    it('should validate title is required', () => {
      component.currentTask.title = '';
      const isValid = component.validateTask();

      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Title is required');
    });

    it('should validate title length', () => {
      component.currentTask.title = 'a'.repeat(201);
      const isValid = component.validateTask();

      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Title must be less than 200 characters');
    });

    it('should validate description is required', () => {
      component.currentTask.title = 'Valid Title';
      component.currentTask.description = '';
      const isValid = component.validateTask();

      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Description is required');
    });

    it('should validate priority range', () => {
      component.currentTask.title = 'Valid Title';
      component.currentTask.description = 'Valid Description';
      component.currentTask.status = TaskStatus.TODO;
      component.currentTask.priority = 10;

      const isValid = component.validateTask();

      expect(isValid).toBe(false);
      expect(window.alert).toHaveBeenCalledWith('Priority must be between 1 and 5');
    });

    it('should pass validation with valid data', () => {
      component.currentTask = {
        title: 'Valid Title',
        description: 'Valid Description',
        status: TaskStatus.TODO,
        priority: 3
      };

      const isValid = component.validateTask();

      expect(isValid).toBe(true);
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  describe('Helper Methods', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should get priority label', () => {
      expect(component.getPriorityLabel(1)).toBe('Critical');
      expect(component.getPriorityLabel(2)).toBe('High');
      expect(component.getPriorityLabel(3)).toBe('Medium');
      expect(component.getPriorityLabel(4)).toBe('Low');
      expect(component.getPriorityLabel(5)).toBe('Very Low');
    });

    it('should get priority class', () => {
      expect(component.getPriorityClass(1)).toBe('bg-priority-critical');
      expect(component.getPriorityClass(2)).toBe('bg-priority-high');
      expect(component.getPriorityClass(3)).toBe('bg-priority-medium');
      expect(component.getPriorityClass(4)).toBe('bg-priority-low');
      expect(component.getPriorityClass(5)).toBe('bg-priority-very-low');
    });

    it('should get status class', () => {
      expect(component.getStatusClass(TaskStatus.TODO)).toBe('bg-status-todo');
      expect(component.getStatusClass(TaskStatus.IN_PROGRESS)).toBe('bg-status-in-progress');
      expect(component.getStatusClass(TaskStatus.DONE)).toBe('bg-status-done');
    });

    it('should get status label', () => {
      expect(component.getStatusLabel(TaskStatus.TODO)).toBe('To Do');
      expect(component.getStatusLabel(TaskStatus.IN_PROGRESS)).toBe('In Progress');
      expect(component.getStatusLabel(TaskStatus.DONE)).toBe('Done');
    });

    it('should get priority icon', () => {
      expect(component.getPriorityIcon(1)).toBe('bi bi-exclamation-circle-fill');
      expect(component.getPriorityIcon(2)).toBe('bi bi-exclamation-triangle-fill');
      expect(component.getPriorityIcon(3)).toBe('bi bi-info-circle-fill');
    });

    it('should get status icon', () => {
      expect(component.getStatusIcon(TaskStatus.TODO)).toBe('bi bi-clipboard');
      expect(component.getStatusIcon(TaskStatus.IN_PROGRESS)).toBe('bi bi-arrow-repeat');
      expect(component.getStatusIcon(TaskStatus.DONE)).toBe('bi bi-check-circle-fill');
    });

    it('should format date correctly', () => {
      const result = component.formatDate('2025-12-31');
      expect(result).toContain('2025');
    });

    it('should handle undefined date', () => {
      const result = component.formatDate(undefined);
      expect(result).toBe('No due date');
    });

    it('should get task count by status', () => {
      expect(component.getTaskCountByStatus('TODO')).toBe(1);
      expect(component.getTaskCountByStatus('IN_PROGRESS')).toBe(1);
      expect(component.getTaskCountByStatus('DONE')).toBe(1);
    });

    it('should calculate time ago for recent times', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

      const result = component.getTimeAgo(fiveMinutesAgo);
      expect(result).toContain('m ago');
    });

    it('should return "Just now" for very recent times', () => {
      const now = new Date().toISOString();
      const result = component.getTimeAgo(now);
      expect(result).toBe('Just now');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty task list', () => {
      mockTaskService.getAllTasks.and.returnValue(of([]));
      fixture.detectChanges();

      expect(component.tasks.length).toBe(0);
      expect(component.filteredTasks.length).toBe(0);
    });

    it('should handle task without ID when deleting', () => {
      spyOn(window, 'confirm').and.returnValue(true);

      component.deleteTask(undefined);

      expect(mockTaskService.deleteTask).not.toHaveBeenCalled();
    });

    it('should not save task if validation fails', () => {
      component.currentTask.title = '';
      spyOn(window, 'alert');

      component.saveTask();

      expect(mockTaskService.createTask).not.toHaveBeenCalled();
      expect(mockTaskService.updateTask).not.toHaveBeenCalled();
    });

    it('should handle error when creating task', () => {
      const newTask: Task = {
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: 3
      };

      mockTaskService.createTask.and.returnValue(
        throwError(() => new Error('Server error'))
      );

      component.currentTask = newTask;
      component.isEditMode = false;
      component.saveTask();

      expect(component.error).toBe('Failed to create task. Please try again.');
    });

    it('should handle error when updating task', () => {
      const updatedTask: Task = {
        id: '1',
        title: 'Updated Task',
        description: 'Updated Description',
        status: TaskStatus.DONE,
        priority: 1
      };

      mockTaskService.updateTask.and.returnValue(
        throwError(() => new Error('Server error'))
      );

      component.currentTask = updatedTask;
      component.isEditMode = true;
      component.saveTask();

      expect(component.error).toBe('Failed to update task. Please try again.');
    });

    it('should handle error when deleting task', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      mockTaskService.deleteTask.and.returnValue(
        throwError(() => new Error('Server error'))
      );

      component.deleteTask('1');

      expect(component.error).toBe('Failed to delete task. Please try again.');
    });
  });
});
