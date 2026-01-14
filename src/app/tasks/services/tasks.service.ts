import { Injectable, signal, computed, effect } from '@angular/core';
import { Task, TaskStatus } from '../interface/task.interface';

const STORAGE_KEY = 'mytask_tasks';

export type SortOption =
  | 'title-asc'
  | 'title-desc'
  | 'date-asc'
  | 'date-desc'
  | 'status-asc'
  | 'status-desc';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  tasksState = signal<Task[]>([]);

  constructor() {
    this.initializeTasks();

    effect(() => {
      const tasks = this.tasks();
      this.saveTasksToLocalStorage(tasks);
    });
  }

  tasks = this.tasksState.asReadonly();
  
  selectedStatusesState = signal<Set<TaskStatus>>(
    new Set(['Pending', 'In Progress', 'Done'])
  );
  selectedStatuses = this.selectedStatusesState.asReadonly();

  filteredTasksInternal = computed(() => {
    const searchTerm = this.searchTerm();
    const selectedStatuses = this.selectedStatuses();
    const tasks = this.tasks();

    let filtered = tasks;
    if (selectedStatuses.size === 0) {
      return [];
    }
    
    if (selectedStatuses.size < 3) {
      filtered = filtered.filter((task) => selectedStatuses.has(task.status));
    }

    if (searchTerm.trim()) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(lowerSearchTerm) ||
          task.description?.toLowerCase().includes(lowerSearchTerm)
      );
    }

    return filtered;
  });

  filteredTasks = computed(() => {
    const allTasks = this.sortedFilteredTasks();
    const currentPage = this.currentPage();
    const startIndex = (currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return allTasks.slice(startIndex, endIndex);
  });

  totalPages = computed(() => {
    const totalTasks = this.sortedFilteredTasks().length;
    return Math.ceil(totalTasks / this.itemsPerPage);
  });

  searchTermState = signal<string>('');
  searchTerm = this.searchTermState.asReadonly();

  sortTypeState = signal<SortOption>('title-asc');
  sortType = this.sortTypeState.asReadonly();

  itemsPerPage = window.innerWidth > 767 ? 10 : 5;
  currentPageState = signal<number>(1);
  currentPage = this.currentPageState.asReadonly();

  sortedFilteredTasks = computed(() => {
    const filtered = this.filteredTasksInternal();
    const sortType = this.sortType();

    const sorted = [...filtered];

    switch (sortType) {
      case 'title-asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'date-asc':
        sorted.sort(
          (a, b) =>
            a.createdAt.getTime() - b.createdAt.getTime()
        );
        break;
      case 'date-desc':
        sorted.sort(
          (a, b) =>
            b.createdAt.getTime() - a.createdAt.getTime()
        );
        break;
      case 'status-asc':
        const statusOrder: Record<TaskStatus, number> = {
          Pending: 0,
          'In Progress': 1,
          Done: 2,
        };
        sorted.sort((a, b) => {
          const statusDiff = statusOrder[a.status] - statusOrder[b.status];
          if (statusDiff !== 0) {
            return statusDiff;
          }
          return a.title.localeCompare(b.title);
        });
        break;
      case 'status-desc':
        const statusOrderDesc: Record<TaskStatus, number> = {
          Done: 0,
          'In Progress': 1,
          Pending: 2,
        };
        sorted.sort((a, b) => {
          const statusDiff = statusOrderDesc[a.status] - statusOrderDesc[b.status];
          if (statusDiff !== 0) {
            return statusDiff;
          }
          return a.title.localeCompare(b.title);
        });
        break;
    }

    return sorted;
  });

  setSearchTerm(term: string): void {
    this.searchTermState.set(term);
    this.currentPageState.set(1);
  }

  filterTasksByStatus(status: TaskStatus): void {
    this.selectedStatusesState.update((selected) => {
      const newSet = new Set(selected);
      if (newSet.has(status)) {
        newSet.delete(status);
      } else {
        newSet.add(status);
      }
      return newSet;
    });
    this.currentPageState.set(1);
  }

  isStatusSelected(status: TaskStatus): boolean {
    return this.selectedStatuses().has(status);
  }

  setSortType(sortType: SortOption): void {
    this.sortTypeState.set(sortType);
    this.currentPageState.set(1);
  }

  setCurrentPage(page: number): void {
    const totalPages = this.totalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPageState.set(page);
    }
  }

  goToNextPage(): void {
    const currentPage = this.currentPage();
    const totalPages = this.totalPages();
    if (currentPage < totalPages) {
      this.currentPageState.set(currentPage + 1);
    }
  }

  goToPreviousPage(): void {
    const currentPage = this.currentPage();
    if (currentPage > 1) {
      this.currentPageState.set(currentPage - 1);
    }
  }

  addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): void {
    const newTask: Task = {
      ...task,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasksState.update((tasks) => [...tasks, newTask]);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this.tasksState.update((tasks) =>
      tasks.map((task) =>
        task.id === id
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      )
    );
  }

  deleteTask(id: string): void {
    this.tasksState.update((tasks) => tasks.filter((task) => task.id !== id));
  }

  updateTaskStatus(id: string, status: TaskStatus): void {
    this.tasksState.update((tasks) =>
      tasks.map((task) =>
        task.id === id
          ? { ...task, status, updatedAt: new Date() }
          : task
      )
    );
  }

  initializeTasks(): void {
    const storedTasks = this.loadTasksFromLocalStorage();
    
    if (storedTasks && storedTasks.length > 0) {
      this.tasksState.set(storedTasks);
    } else {
      this.initializeMockTasks();
    }
  }

  loadTasksFromLocalStorage(): Task[] | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return null;
      }

      const parsed = JSON.parse(stored) as Task[];

      return parsed.map((task) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
      return null;
    }
  }

  saveTasksToLocalStorage(tasks: Task[]): void {
    try {
      const serialized = JSON.stringify(tasks);
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch (error) {
      console.error('Error saving tasks to localStorage:', error);
    }
  }

  initializeMockTasks(): void {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Task 1',
        description: 'Description 1',
        status: 'Pending',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        title: 'Task 2',
        description: 'Description 2',
        status: 'Done',
        createdAt: new Date('2024-01-16'),
        updatedAt: new Date('2024-01-16'),
      },
      {
        id: '3',
        title: 'Task 3',
        description: 'Description 3',
        status: 'In Progress',
        createdAt: new Date('2024-01-17'),
        updatedAt: new Date('2024-01-17'),
      },
      {
        id: '4',
        title: 'Task 4',
        description: 'Description 4',
        status: 'Pending',
        createdAt: new Date('2024-01-18'),
        updatedAt: new Date('2024-01-18'),
      },
      {
        id: '5',
        title: 'Task 5',
        description: 'Description 5',
        status: 'In Progress',
        createdAt: new Date('2024-01-19'),
        updatedAt: new Date('2024-01-19'),
      },
      {
        id: '6',
        title: 'Task 6',
        description: 'Description 6',
        status: 'Pending',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '7',
        title: 'Task 7',
        description: 'Description 7',
        status: 'Done',
        createdAt: new Date('2024-01-21'),
        updatedAt: new Date('2024-01-21'),
      },
      {
        id: '8',
        title: 'Task 8',
        description: 'Description 8',
        status: 'In Progress',
        createdAt: new Date('2024-01-22'),
        updatedAt: new Date('2024-01-22'),
      },
    ];

    this.tasksState.set(mockTasks);
  }

  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

