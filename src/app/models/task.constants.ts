import { TaskStatus } from './task.model';

export const TASK_CONSTANTS = {
  PRIORITY: {
    MIN: 1,
    MAX: 5,
    DEFAULT: 3,
    LABELS: {
      1: 'Critical',
      2: 'High',
      3: 'Medium',
      4: 'Low',
      5: 'Very Low'
    } as Record<number, string>,
    ICONS: {
      1: 'bi bi-exclamation-circle-fill',
      2: 'bi bi-exclamation-triangle-fill',
      3: 'bi bi-info-circle-fill',
      4: 'bi bi-dash-circle-fill',
      5: 'bi bi-circle-fill'
    } as Record<number, string>,
    CLASSES: {
      1: 'bg-priority-critical',
      2: 'bg-priority-high',
      3: 'bg-priority-medium',
      4: 'bg-priority-low',
      5: 'bg-priority-very-low'
    } as Record<number, string>
  },

  STATUS: {
    LABELS: {
      [TaskStatus.TODO]: 'To Do',
      [TaskStatus.IN_PROGRESS]: 'In Progress',
      [TaskStatus.DONE]: 'Done'
    } as Record<TaskStatus, string>,
    ICONS: {
      [TaskStatus.TODO]: 'bi bi-clipboard',
      [TaskStatus.IN_PROGRESS]: 'bi bi-arrow-repeat',
      [TaskStatus.DONE]: 'bi bi-check-circle-fill'
    } as Record<TaskStatus, string>,
    CLASSES: {
      [TaskStatus.TODO]: 'bg-status-todo',
      [TaskStatus.IN_PROGRESS]: 'bg-status-in-progress',
      [TaskStatus.DONE]: 'bg-status-done'
    } as Record<TaskStatus, string>
  },

  VALIDATION: {
    TITLE_MAX_LENGTH: 200,
    DESCRIPTION_MAX_LENGTH: 1000
  },

  DEFAULTS: {
    SORT_BY: 'priority',
    SORT_DIRECTION: 'asc' as const
  },

  ERROR_MESSAGES: {
    LOAD_FAILED: 'Failed to load tasks. Please try again.',
    CREATE_FAILED: 'Failed to create task. Please try again.',
    UPDATE_FAILED: 'Failed to update task. Please try again.',
    DELETE_FAILED: 'Failed to delete task. Please try again.',
    TITLE_REQUIRED: 'Title is required',
    TITLE_TOO_LONG: 'Title must be less than 200 characters',
    DESCRIPTION_REQUIRED: 'Description is required',
    STATUS_REQUIRED: 'Status is required',
    PRIORITY_INVALID: 'Priority must be between 1 and 5'
  }
} as const;

