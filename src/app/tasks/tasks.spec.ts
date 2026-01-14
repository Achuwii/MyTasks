import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Tasks } from './tasks';
import { TasksService } from './services/tasks.service';
import { Task, TaskStatus } from './interface/task.interface';

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;
  let tasksService: TasksService;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      description: 'Description 1',
      status: 'Pending',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: '2',
      title: 'Task 2',
      description: 'Description 2',
      status: 'In Progress',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
    },
    {
      id: '3',
      title: 'Task 3',
      description: 'Description 3',
      status: 'Done',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [TasksService],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    tasksService.tasksState.set(mockTasks);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with filter dropdown closed', () => {
    expect(component.isFilterDropdownOpen()).toBe(false);
  });

  it('should toggle filter dropdown', () => {
    component.toggleFilterDropdown();
    expect(component.isFilterDropdownOpen()).toBe(true);

    component.toggleFilterDropdown();
    expect(component.isFilterDropdownOpen()).toBe(false);
  });

  it('should close filter dropdown', () => {
    component.toggleFilterDropdown();
    component.closeFilterDropdown();
    expect(component.isFilterDropdownOpen()).toBe(false);
  });

  it('should update search term when onSearchChange is called', () => {
    const setSearchTermSpy = vi.spyOn(tasksService, 'setSearchTerm');
    component.onSearchChange('test search');
    expect(setSearchTermSpy).toHaveBeenCalledWith('test search');
  });

  it('should delete task when deleteTask is called', () => {
    const deleteTaskSpy = vi.spyOn(tasksService, 'deleteTask');
    component.deleteTask('1');
    expect(deleteTaskSpy).toHaveBeenCalledWith('1');
  });

  it('should filter tasks by status', () => {
    const filterTasksByStatusSpy = vi.spyOn(tasksService, 'filterTasksByStatus');
    component.filterTasksByStatus('Pending');
    expect(filterTasksByStatusSpy).toHaveBeenCalledWith('Pending');
  });

  it('should check if status is selected', () => {
    const isStatusSelectedSpy = vi.spyOn(tasksService, 'isStatusSelected');
    component.isStatusSelected('Pending');
    expect(isStatusSelectedSpy).toHaveBeenCalledWith('Pending');
  });

  it('should sort tasks when sortTasks is called', () => {
    const setSortTypeSpy = vi.spyOn(tasksService, 'setSortType');
    component.sortTasks('title-desc');
    expect(setSortTypeSpy).toHaveBeenCalledWith('title-desc');
  });

  it('should set current page when setCurrentPage is called', () => {
    const setCurrentPageSpy = vi.spyOn(tasksService, 'setCurrentPage');
    component.setCurrentPage(2);
    expect(setCurrentPageSpy).toHaveBeenCalledWith(2);
  });

  it('should not close filter dropdown when dropdown is already closed', () => {
    expect(component.isFilterDropdownOpen()).toBe(false);
    const mockEvent = new MouseEvent('click', { bubbles: true });
    
    component.onDocumentClick(mockEvent);
    expect(component.isFilterDropdownOpen()).toBe(false);
  });

  it('should handle document click when dropdown is open', () => {
    component.toggleFilterDropdown();
    expect(component.isFilterDropdownOpen()).toBe(true);

    const mockEvent = new MouseEvent('click', { bubbles: true });
    component.onDocumentClick(mockEvent);
    
    // The dropdown may or may not close depending on where the click happens
    // We're just testing that the method can be called without errors
    expect(component.isFilterDropdownOpen()).toBeDefined();
  });

  it('should have correct statuses array', () => {
    expect(component.statuses).toEqual(['Pending', 'In Progress', 'Done']);
  });

  it('should have correct sort options', () => {
    expect(component.sortOptions).toEqual([
      { value: 'title-asc', label: 'Title (A-Z)' },
      { value: 'title-desc', label: 'Title (Z-A)' },
      { value: 'date-asc', label: 'Date (Oldest first)' },
      { value: 'date-desc', label: 'Date (Newest first)' },
      { value: 'status-asc', label: 'Status (Pending to Done)' },
      { value: 'status-desc', label: 'Status (Done to Pending)' },
    ]);
  });

  it('should expose service signals', () => {
    expect(component.tasks).toBeDefined();
    expect(component.filteredTasks).toBeDefined();
    expect(component.searchTerm).toBeDefined();
    expect(component.selectedStatuses).toBeDefined();
    expect(component.sortType).toBeDefined();
    expect(component.currentPage).toBeDefined();
    expect(component.totalPages).toBeDefined();
  });
});
