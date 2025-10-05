import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { Task, TaskStatus, TaskFilterParams } from '../../models/task.model';
import { TASK_CONSTANTS } from '../../models/task.constants';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit, OnDestroy {
  // Observables
  private readonly destroy$ = new Subject<void>();

  // Data properties
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  readonly TaskStatus = TaskStatus;

  // Filter properties
  filterStatus = '';
  filterPriority = '';
  searchQuery = '';
  dueDateFrom = '';
  dueDateTo = '';
  sortBy = TASK_CONSTANTS.DEFAULTS.SORT_BY;
  sortDirection: 'asc' | 'desc' = TASK_CONSTANTS.DEFAULTS.SORT_DIRECTION;

  // Modal properties
  showModal = false;
  isEditMode = false;
  currentTask: Task = this.getEmptyTask();

  // Details modal
  showDetailsModal = false;
  selectedTask: Task | null = null;

  // Loading and error states
  loading = false;
  error = '';

  constructor(private readonly taskService: TaskService) { }

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.loading = true;
    this.error = '';

    const filters: TaskFilterParams = this.buildFilterParams();

    this.taskService.getAllTasks(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          this.tasks = data;
          this.filteredTasks = data;
        },
        error: (err) => {
          this.error = TASK_CONSTANTS.ERROR_MESSAGES.LOAD_FAILED;
          console.error('Error loading tasks:', err);
        }
      });
  }

  buildFilterParams(): TaskFilterParams {
    const filters: TaskFilterParams = {};

    if (this.filterStatus) {
      filters.status = this.filterStatus as TaskStatus;
    }
    if (this.filterPriority) {
      filters.priority = parseInt(this.filterPriority, 10);
    }
    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }
    if (this.dueDateFrom) {
      filters.dueDateFrom = this.dueDateFrom;
    }
    if (this.dueDateTo) {
      filters.dueDateTo = this.dueDateTo;
    }
    if (this.sortBy) {
      filters.sortBy = this.sortBy;
    }
    if (this.sortDirection) {
      filters.sortDirection = this.sortDirection;
    }

    return filters;
  }

  applyFilters(): void {
    this.loadTasks();
  }

  clearFilters(): void {
    this.filterStatus = '';
    this.filterPriority = '';
    this.searchQuery = '';
    this.dueDateFrom = '';
    this.dueDateTo = '';
    this.sortBy = TASK_CONSTANTS.DEFAULTS.SORT_BY;
    this.sortDirection = TASK_CONSTANTS.DEFAULTS.SORT_DIRECTION;
    this.loadTasks();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentTask = this.getEmptyTask();
    this.showModal = true;
  }

  openEditModal(task: Task): void {
    this.isEditMode = true;
    this.currentTask = { ...task };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentTask = this.getEmptyTask();
    this.error = '';
  }

  saveTask(): void {
    if (!this.validateTask()) {
      return;
    }

    this.loading = true;
    const operation$ = this.isEditMode && this.currentTask.id
      ? this.taskService.updateTask(this.currentTask.id, this.currentTask)
      : this.taskService.createTask(this.currentTask);

    operation$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.loadTasks();
          this.closeModal();
        },
        error: (err) => {
          this.error = this.isEditMode
            ? TASK_CONSTANTS.ERROR_MESSAGES.UPDATE_FAILED
            : TASK_CONSTANTS.ERROR_MESSAGES.CREATE_FAILED;
          console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} task:`, err);
        }
      });
  }

  deleteTask(id: string | undefined): void {
    if (!id) {
      return;
    }

    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    this.loading = true;
    this.taskService.deleteTask(id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: () => {
          this.loadTasks();
        },
        error: (err) => {
          this.error = TASK_CONSTANTS.ERROR_MESSAGES.DELETE_FAILED;
          console.error('Error deleting task:', err);
        }
      });
  }

  viewTaskDetails(task: Task): void {
    this.selectedTask = task;
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedTask = null;
  }

  validateTask(): boolean {
    const { title, description, status, priority } = this.currentTask;

    if (!title?.trim()) {
      alert(TASK_CONSTANTS.ERROR_MESSAGES.TITLE_REQUIRED);
      return false;
    }

    if (title.length > TASK_CONSTANTS.VALIDATION.TITLE_MAX_LENGTH) {
      alert(TASK_CONSTANTS.ERROR_MESSAGES.TITLE_TOO_LONG);
      return false;
    }

    if (!description?.trim()) {
      alert(TASK_CONSTANTS.ERROR_MESSAGES.DESCRIPTION_REQUIRED);
      return false;
    }

    if (!status) {
      alert(TASK_CONSTANTS.ERROR_MESSAGES.STATUS_REQUIRED);
      return false;
    }

    if (!priority || priority < TASK_CONSTANTS.PRIORITY.MIN || priority > TASK_CONSTANTS.PRIORITY.MAX) {
      alert(TASK_CONSTANTS.ERROR_MESSAGES.PRIORITY_INVALID);
      return false;
    }

    return true;
  }

  private getEmptyTask(): Task {
    return {
      title: '',
      description: '',
      status: TaskStatus.TODO,
      priority: TASK_CONSTANTS.PRIORITY.DEFAULT,
      dueDate: ''
    };
  }

  // Helper methods
  getPriorityLabel(priority: number): string {
    return TASK_CONSTANTS.PRIORITY.LABELS[priority] || 'Unknown';
  }

  getPriorityClass(priority: number): string {
    return TASK_CONSTANTS.PRIORITY.CLASSES[priority] || 'bg-secondary';
  }

  getStatusClass(status: TaskStatus): string {
    return TASK_CONSTANTS.STATUS.CLASSES[status] || 'bg-secondary';
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return 'No due date';
    }

    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  }

  formatDetailDate(date: string): string {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }

  getTimeAgo(date: string): string {
    try {
      const now = new Date();
      const past = new Date(date);
      const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffInSeconds < 60) return 'Just now';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
      if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
      return past.toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }

  getTaskCountByStatus(status: string): number {
    return this.filteredTasks.filter(task => task.status === status).length;
  }

  getPriorityIcon(priority: number): string {
    return TASK_CONSTANTS.PRIORITY.ICONS[priority] || 'bi bi-circle';
  }

  getStatusIcon(status: TaskStatus): string {
    return TASK_CONSTANTS.STATUS.ICONS[status] || 'bi bi-question-circle';
  }

  getStatusLabel(status: TaskStatus): string {
    return TASK_CONSTANTS.STATUS.LABELS[status] || status;
  }
}
