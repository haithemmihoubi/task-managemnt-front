import { Task, TaskStatus } from '../models/task.model';

/**
 * Test Utilities for Task Management Application
 * Provides helper functions and mock data for testing
 */

export class TestDataFactory {
  /**
   * Create a mock task with default values
   */
  static createMockTask(overrides?: Partial<Task>): Task {
    return {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: TaskStatus.TODO,
      priority: 3,
      dueDate: '2025-12-31',
      createdAt: '2025-10-04T10:00:00Z',
      updatedAt: '2025-10-04T10:00:00Z',
      ...overrides
    };
  }

  /**
   * Create multiple mock tasks
   */
  static createMockTasks(count: number): Task[] {
    return Array.from({ length: count }, (_, i) =>
      this.createMockTask({
        id: `${i + 1}`,
        title: `Test Task ${i + 1}`,
        description: `Test Description ${i + 1}`,
        status: this.getRotatingStatus(i),
        priority: (i % 5) + 1
      })
    );
  }

  /**
   * Get rotating status for variety in test data
   */
  private static getRotatingStatus(index: number): TaskStatus {
    const statuses = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE];
    return statuses[index % 3];
  }

  /**
   * Create a task with specific status
   */
  static createTaskWithStatus(status: TaskStatus): Task {
    return this.createMockTask({ status });
  }

  /**
   * Create a task with specific priority
   */
  static createTaskWithPriority(priority: number): Task {
    return this.createMockTask({ priority });
  }

  /**
   * Create a task with critical priority
   */
  static createCriticalTask(): Task {
    return this.createMockTask({
      priority: 1,
      title: 'Critical Task',
      status: TaskStatus.IN_PROGRESS
    });
  }

  /**
   * Create a completed task
   */
  static createCompletedTask(): Task {
    return this.createMockTask({
      status: TaskStatus.DONE,
      title: 'Completed Task'
    });
  }

  /**
   * Create an overdue task
   */
  static createOverdueTask(): Task {
    return this.createMockTask({
      dueDate: '2025-01-01',
      title: 'Overdue Task'
    });
  }

  /**
   * Create a task without optional fields
   */
  static createMinimalTask(): Task {
    return {
      title: 'Minimal Task',
      description: 'Minimal Description',
      status: TaskStatus.TODO,
      priority: 3
    };
  }

  /**
   * Create invalid task data for validation testing
   */
  static createInvalidTask(invalidField: 'title' | 'description' | 'priority'): Task {
    const task = this.createMinimalTask();

    switch (invalidField) {
      case 'title':
        task.title = '';
        break;
      case 'description':
        task.description = '';
        break;
      case 'priority':
        task.priority = 10;
        break;
    }

    return task;
  }
}

/**
 * Mock HTTP response helpers
 */
export class MockHttpHelpers {
  /**
   * Create a successful HTTP response
   */
  static createSuccessResponse<T>(data: T) {
    return {
      status: 200,
      statusText: 'OK',
      data
    };
  }

  /**
   * Create an error response
   */
  static createErrorResponse(status: number, message: string) {
    return {
      status,
      statusText: message,
      error: { message }
    };
  }

  /**
   * Create a 404 Not Found response
   */
  static createNotFoundResponse() {
    return this.createErrorResponse(404, 'Not Found');
  }

  /**
   * Create a 500 Server Error response
   */
  static createServerErrorResponse() {
    return this.createErrorResponse(500, 'Internal Server Error');
  }

  /**
   * Create a 400 Bad Request response
   */
  static createBadRequestResponse(message: string = 'Bad Request') {
    return this.createErrorResponse(400, message);
  }
}

/**
 * Test assertions helpers
 */
export class TestAssertions {
  /**
   * Assert that two tasks are equal
   */
  static assertTasksEqual(actual: Task, expected: Task): void {
    expect(actual.id).toBe(expected.id);
    expect(actual.title).toBe(expected.title);
    expect(actual.description).toBe(expected.description);
    expect(actual.status).toBe(expected.status);
    expect(actual.priority).toBe(expected.priority);
  }

  /**
   * Assert that a task has required fields
   */
  static assertTaskHasRequiredFields(task: Task): void {
    expect(task.title).toBeDefined();
    expect(task.title).not.toBe('');
    expect(task.description).toBeDefined();
    expect(task.description).not.toBe('');
    expect(task.status).toBeDefined();
    expect(task.priority).toBeDefined();
    expect(task.priority).toBeGreaterThanOrEqual(1);
    expect(task.priority).toBeLessThanOrEqual(5);
  }

  /**
   * Assert that a task array is sorted by priority
   */
  static assertSortedByPriority(tasks: Task[], ascending: boolean = true): void {
    for (let i = 0; i < tasks.length - 1; i++) {
      const comparison = ascending
        ? tasks[i].priority <= tasks[i + 1].priority
        : tasks[i].priority >= tasks[i + 1].priority;
      expect(comparison).toBe(true);
    }
  }
}

/**
 * Async test helpers
 */
export class AsyncTestHelpers {
  /**
   * Wait for a specific amount of time
   */
  static async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait until a condition is true
   */
  static async waitUntil(
    condition: () => boolean,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();

    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error('Timeout waiting for condition');
      }
      await this.wait(interval);
    }
  }
}

/**
 * DOM test helpers
 */
export class DomTestHelpers {
  /**
   * Get element by CSS selector
   */
  static querySelector<T extends HTMLElement>(
    fixture: any,
    selector: string
  ): T | null {
    return fixture.nativeElement.querySelector(selector);
  }

  /**
   * Get all elements by CSS selector
   */
  static querySelectorAll<T extends HTMLElement>(
    fixture: any,
    selector: string
  ): NodeListOf<T> {
    return fixture.nativeElement.querySelectorAll(selector);
  }

  /**
   * Click an element
   */
  static click(element: HTMLElement): void {
    element.click();
  }

  /**
   * Set input value
   */
  static setInputValue(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  /**
   * Trigger change event on select
   */
  static selectOption(select: HTMLSelectElement, value: string): void {
    select.value = value;
    select.dispatchEvent(new Event('change'));
  }
}

/**
 * Spy helpers for Jasmine
 */
export class SpyHelpers {
  /**
   * Create a spy that returns values in sequence
   */
  static createSequentialSpy<T>(name: string, values: T[]): jasmine.Spy {
    let callCount = 0;
    return jasmine.createSpy(name).and.callFake(() => {
      const value = values[callCount % values.length];
      callCount++;
      return value;
    });
  }

  /**
   * Create a spy that throws an error
   */
  static createErrorSpy(name: string, error: Error): jasmine.Spy {
    return jasmine.createSpy(name).and.throwError(error);
  }
}

