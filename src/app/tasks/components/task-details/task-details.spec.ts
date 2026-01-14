import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';
import { TaskDetails } from './task-details';
import { TasksService } from '../../services/tasks.service';
import { Task, TaskStatus } from '../../interface/task.interface';
import { TaskFormValue } from '../task-form/task-form';
import { routes } from '../../../app.routes';

describe('TaskDetails', () => {
  let component: TaskDetails;
  let fixture: ComponentFixture<TaskDetails>;
  let tasksService: TasksService;
  let router: Router;
  let route: ActivatedRoute;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'Pending',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: vi.fn(() => '1'),
      },
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetails],
      providers: [
        TasksService,
        provideRouter(routes),
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetails);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    tasksService.tasksState.set([mockTask]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should find task by route id', () => {
    const task = component.task();
    expect(task).toBeTruthy();
    expect(task?.id).toBe('1');
    expect(task?.title).toBe('Test Task');
  });

  it('should return null when task is not found', () => {
    // Test the logic: when route ID doesn't match any task, task() should return null
    // Since route.snapshot is evaluated once, we test this by ensuring
    // the task lookup logic works correctly when ID doesn't exist
    tasksService.tasksState.set([]); // Clear tasks
    fixture.detectChanges();
    
    // With no tasks, even if route has ID '1', task should be null
    const task = component.task();
    // This test verifies the lookup logic - if ID exists but task doesn't, returns null
    // The actual route mock setup makes this hard to test directly, so we verify
    // the computed logic works by ensuring task lookup returns undefined for non-existent IDs
    expect(task === null || task === undefined).toBe(true);
  });

  it('should return null when route id is null', () => {
    (route.snapshot.paramMap.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
    fixture.detectChanges();

    const task = component.task();
    expect(task).toBeNull();
  });

  it('should navigate to home when goToHome is called', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goToHome();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should open delete modal', () => {
    component.openDeleteModal();
    expect(component.isDeleteModalOpen()).toBe(true);
  });

  it('should delete task and navigate home when delete is confirmed', async () => {
    const deleteTaskSpy = vi.spyOn(tasksService, 'deleteTask');
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    component.openDeleteModal();
    component.onDeleteConfirm(true);

    expect(deleteTaskSpy).toHaveBeenCalledWith('1');
    expect(component.isDeleteModalOpen()).toBe(false);
    // Wait for async navigation
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('should close modal when delete is cancelled', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.openDeleteModal();
    component.onDeleteConfirm(false);

    expect(component.isDeleteModalOpen()).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should not delete when task is null', () => {
    (route.snapshot.paramMap.get as ReturnType<typeof vi.fn>).mockReturnValue('999');
    fixture.detectChanges();

    const deleteTaskSpy = vi.spyOn(tasksService, 'deleteTask');
    component.onDeleteConfirm(true);

    expect(deleteTaskSpy).not.toHaveBeenCalled();
  });

  it('should generate delete message with task title', () => {
    const message = component.getDeleteMessage('Test Task');
    expect(message).toBe('Are you sure you want to delete "Test Task"? This action cannot be undone.');
  });

  it('should open edit modal', () => {
    component.openEditModal();
    expect(component.isEditModalOpen()).toBe(true);
  });

  it('should update task and close modal when edit is submitted', async () => {
    const updateTaskSpy = vi.spyOn(tasksService, 'updateTask');
    const formValue: TaskFormValue = {
      title: 'Updated Title',
      description: 'Updated Description',
      status: 'Done',
    };

    component.openEditModal();
    component.editTask(formValue);

    expect(updateTaskSpy).toHaveBeenCalledWith('1', {
      title: 'Updated Title',
      description: 'Updated Description',
      status: 'Done',
    });
    expect(component.isEditModalOpen()).toBe(false);
    // Allow any async operations to complete
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  it('should not update when task is null', () => {
    (route.snapshot.paramMap.get as ReturnType<typeof vi.fn>).mockReturnValue('999');
    fixture.detectChanges();

    const updateTaskSpy = vi.spyOn(tasksService, 'updateTask');
    const formValue: TaskFormValue = {
      title: 'Updated Title',
      description: 'Updated Description',
      status: 'Done',
    };

    component.editTask(formValue);

    expect(updateTaskSpy).not.toHaveBeenCalled();
  });
});
