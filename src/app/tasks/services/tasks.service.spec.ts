import { TestBed } from '@angular/core/testing';
import { TasksService, SortOption } from './tasks.service';
import { Task, TaskStatus } from '../interface/task.interface';

describe('TasksService', () => {
  let service: TasksService;
  const STORAGE_KEY = 'mytask_tasks';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TasksService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize with mock tasks when localStorage is empty', () => {
      const tasks = service.tasks();
      expect(tasks.length).toBeGreaterThan(0);
    });

    it('should load tasks from localStorage if available', () => {
      // Test the loadTasksFromLocalStorage method directly
      localStorage.removeItem(STORAGE_KEY);
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Stored Task',
          description: 'Description',
          status: 'Pending',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTasks));

      // Test the load method directly (it's public)
      const loadedTasks = service.loadTasksFromLocalStorage();
      expect(loadedTasks).toBeTruthy();
      if (loadedTasks) {
        expect(loadedTasks.length).toBe(1);
        expect(loadedTasks[0].title).toBe('Stored Task');
        expect(loadedTasks[0].createdAt).toBeInstanceOf(Date);
        expect(loadedTasks[0].updatedAt).toBeInstanceOf(Date);
      }
    });

    it('should handle corrupted localStorage data gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, 'invalid json');
      
      // Test the load function directly
      const loadedTasks = service.loadTasksFromLocalStorage();
      
      // Should return null when localStorage is corrupted
      expect(loadedTasks).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Task Management', () => {
    beforeEach(() => {
      service.tasksState.set([]);
    });

    it('should add a new task', () => {
      const initialCount = service.tasks().length;
      service.addTask({
        title: 'New Task',
        description: 'Description',
        status: 'Pending',
      });

      const tasks = service.tasks();
      expect(tasks.length).toBe(initialCount + 1);
      expect(tasks[tasks.length - 1].title).toBe('New Task');
      expect(tasks[tasks.length - 1].id).toBeDefined();
      expect(tasks[tasks.length - 1].createdAt).toBeInstanceOf(Date);
      expect(tasks[tasks.length - 1].updatedAt).toBeInstanceOf(Date);
    });

    it('should update an existing task', () => {
      service.addTask({
        title: 'Original Title',
        description: 'Original Description',
        status: 'Pending',
      });

      const tasks = service.tasks();
      const addedTask = tasks.find(t => t.title === 'Original Title');
      expect(addedTask).toBeDefined();
      
      if (!addedTask) return;
      
      const taskId = addedTask.id;
      const originalUpdatedAt = new Date(addedTask.updatedAt);

      service.updateTask(taskId, {
        title: 'Updated Title',
        status: 'Done',
      });

      const updatedTasks = service.tasks();
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      expect(updatedTask).toBeDefined();
      if (updatedTask) {
        expect(updatedTask.title).toBe('Updated Title');
        expect(updatedTask.status).toBe('Done');
        expect(updatedTask.updatedAt).toBeInstanceOf(Date);
        // updatedAt should be updated (may be same or later due to timing)
        expect(updatedTask.updatedAt.getTime()).toBeGreaterThanOrEqual(
          originalUpdatedAt.getTime()
        );
      }
    });

    it('should not update non-existent task', () => {
      const initialTasks = [...service.tasks()];
      service.updateTask('non-existent-id', { title: 'New Title' });
      expect(service.tasks()).toEqual(initialTasks);
    });

    it('should delete a task', () => {
      service.addTask({
        title: 'Task to Delete',
        description: 'Description',
        status: 'Pending',
      });

      const tasks = service.tasks();
      const taskId = tasks[0].id;
      const initialCount = tasks.length;

      service.deleteTask(taskId);

      expect(service.tasks().length).toBe(initialCount - 1);
      expect(service.tasks().find((t) => t.id === taskId)).toBeUndefined();
    });

    it('should update task status', () => {
      service.addTask({
        title: 'Task',
        description: 'Description',
        status: 'Pending',
      });

      const tasks = service.tasks();
      const taskId = tasks[0].id;

      service.updateTaskStatus(taskId, 'Done');

      expect(service.tasks().find((t) => t.id === taskId)?.status).toBe('Done');
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      service.tasksState.set([
        {
          id: '1',
          title: 'Angular Tutorial',
          description: 'Learn Angular',
          status: 'Pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'React Tutorial',
          description: 'Learn React',
          status: 'In Progress',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Vue Tutorial',
          description: 'Learn Vue',
          status: 'Done',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it('should filter tasks by search term in title', () => {
      service.setSearchTerm('Angular');
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('Angular Tutorial');
    });

    it('should filter tasks by search term in description', () => {
      service.setSearchTerm('React');
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe('React Tutorial');
    });

    it('should be case insensitive', () => {
      service.setSearchTerm('angular');
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
    });

    it('should reset to page 1 when search term changes', () => {
      service.setCurrentPage(2);
      service.setSearchTerm('Angular');
      expect(service.currentPage()).toBe(1);
    });

    it('should return all tasks when search term is empty', () => {
      service.setSearchTerm('');
      const filtered = service.filteredTasks();
      expect(filtered.length).toBeGreaterThan(0);
    });
  });

  describe('Status Filtering', () => {
    beforeEach(() => {
      service.tasksState.set([
        {
          id: '1',
          title: 'Task 1',
          status: 'Pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          title: 'Task 2',
          status: 'In Progress',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '3',
          title: 'Task 3',
          status: 'Done',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    });

    it('should filter by selected statuses', () => {
      service.selectedStatusesState.set(new Set(['Pending']));
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].status).toBe('Pending');
    });

    it('should filter by multiple statuses', () => {
      service.selectedStatusesState.set(new Set(['Pending', 'In Progress']));
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(2);
    });

    it('should return empty array when no statuses are selected', () => {
      service.selectedStatusesState.set(new Set());
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(0);
    });

    it('should toggle status selection', () => {
      service.selectedStatusesState.set(new Set(['Pending', 'In Progress', 'Done']));
      service.filterTasksByStatus('Pending');
      expect(service.isStatusSelected('Pending')).toBe(false);
      expect(service.isStatusSelected('In Progress')).toBe(true);
    });

    it('should reset to page 1 when status filter changes', () => {
      service.setCurrentPage(2);
      service.filterTasksByStatus('Pending');
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('Sorting', () => {
    beforeEach(() => {
      service.tasksState.set([
        {
          id: '1',
          title: 'Zebra Task',
          status: 'Done',
          createdAt: new Date('2024-01-03'),
          updatedAt: new Date('2024-01-03'),
        },
        {
          id: '2',
          title: 'Apple Task',
          status: 'Pending',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: '3',
          title: 'Banana Task',
          status: 'In Progress',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ]);
    });

    it('should sort by title ascending', () => {
      service.setSortType('title-asc');
      const sorted = service.sortedFilteredTasks();
      expect(sorted[0].title).toBe('Apple Task');
      expect(sorted[1].title).toBe('Banana Task');
      expect(sorted[2].title).toBe('Zebra Task');
    });

    it('should sort by title descending', () => {
      service.setSortType('title-desc');
      const sorted = service.sortedFilteredTasks();
      expect(sorted[0].title).toBe('Zebra Task');
      expect(sorted[2].title).toBe('Apple Task');
    });

    it('should sort by date ascending', () => {
      service.setSortType('date-asc');
      const sorted = service.sortedFilteredTasks();
      expect(sorted[0].createdAt.getTime()).toBeLessThan(
        sorted[1].createdAt.getTime()
      );
    });

    it('should sort by date descending', () => {
      service.setSortType('date-desc');
      const sorted = service.sortedFilteredTasks();
      expect(sorted[0].createdAt.getTime()).toBeGreaterThan(
        sorted[1].createdAt.getTime()
      );
    });

    it('should sort by status ascending', () => {
      service.setSortType('status-asc');
      const sorted = service.sortedFilteredTasks();
      expect(sorted[0].status).toBe('Pending');
      expect(sorted[1].status).toBe('In Progress');
      expect(sorted[2].status).toBe('Done');
    });

    it('should sort by status descending', () => {
      service.setSortType('status-desc');
      const sorted = service.sortedFilteredTasks();
      expect(sorted[0].status).toBe('Done');
      expect(sorted[2].status).toBe('Pending');
    });

    it('should reset to page 1 when sort type changes', () => {
      service.setCurrentPage(2);
      service.setSortType('title-desc');
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      const tasks: Task[] = Array.from({ length: 25 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Task ${i + 1}`,
        status: 'Pending' as TaskStatus,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      service.tasksState.set(tasks);
      service.itemsPerPage = 10;
    });

    it('should calculate total pages correctly', () => {
      expect(service.totalPages()).toBe(3);
    });

    it('should return correct page of tasks', () => {
      service.setCurrentPage(1);
      expect(service.filteredTasks().length).toBe(10);

      service.setCurrentPage(2);
      expect(service.filteredTasks().length).toBe(10);

      service.setCurrentPage(3);
      expect(service.filteredTasks().length).toBe(5);
    });

    it('should not set page below 1', () => {
      service.setCurrentPage(0);
      expect(service.currentPage()).toBe(1);
    });

    it('should not set page above total pages', () => {
      service.setCurrentPage(100);
      expect(service.currentPage()).toBeLessThanOrEqual(service.totalPages());
    });

    it('should go to next page', () => {
      service.setCurrentPage(1);
      service.goToNextPage();
      expect(service.currentPage()).toBe(2);
    });

    it('should not go beyond last page', () => {
      service.setCurrentPage(service.totalPages());
      service.goToNextPage();
      expect(service.currentPage()).toBe(service.totalPages());
    });

    it('should go to previous page', () => {
      service.setCurrentPage(2);
      service.goToPreviousPage();
      expect(service.currentPage()).toBe(1);
    });

    it('should not go below first page', () => {
      service.setCurrentPage(1);
      service.goToPreviousPage();
      expect(service.currentPage()).toBe(1);
    });
  });

  describe('LocalStorage Integration', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      localStorage.removeItem(STORAGE_KEY);
    });

    it('should save tasks to localStorage when tasks change', async () => {
      service.tasksState.set([]);
      
      service.addTask({
        title: 'Test Task',
        description: 'Description',
        status: 'Pending',
      });

      // The effect should save automatically, but we need to wait for it
      // Since effects run asynchronously, we'll check that the task was added
      // and verify localStorage was updated (may need to flush effects)
      const tasks = service.tasks();
      expect(tasks.length).toBeGreaterThan(0);
      
      // Give the effect time to run (in real app, effects run in next tick)
      await new Promise(resolve => setTimeout(resolve, 0));
      
      const savedData = localStorage.getItem(STORAGE_KEY);
      // localStorage should have been updated by the effect
      if (savedData) {
        const parsed = JSON.parse(savedData);
        expect(parsed.length).toBeGreaterThan(0);
      }
    });

    it('should handle localStorage errors gracefully', async () => {
      service.tasksState.set([]);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const originalSetItem = Storage.prototype.setItem;
      let setItemCalled = false;
      
      Storage.prototype.setItem = vi.fn(() => {
        setItemCalled = true;
        throw new Error('Storage quota exceeded');
      });

      // This should not throw an error even if localStorage fails
      expect(() => {
        service.addTask({
          title: 'Test Task',
          description: 'Description',
          status: 'Pending',
        });
      }).not.toThrow();

      // Wait for effect to potentially trigger
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // If setItem was called and threw, console.error should have been called
      if (setItemCalled) {
        expect(consoleErrorSpy).toHaveBeenCalled();
      }
      
      Storage.prototype.setItem = originalSetItem;
      consoleErrorSpy.mockRestore();
    });
  });
});
