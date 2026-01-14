import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TaskItem } from './task-item';
import { Task, TaskStatus } from '../../interface/task.interface';

describe('TaskItem', () => {
  let component: TaskItem;
  let fixture: ComponentFixture<TaskItem>;
  let router: Router;

  const mockTask: Task = {
    id: '1',
    title: 'Test Task with a Very Long Title That Should Be Truncated',
    description: 'Test Description',
    status: 'Pending',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  const mockRouter = {
    navigate: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItem],
      providers: [{ provide: Router, useValue: mockRouter }],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItem);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should truncate title when longer than maxTitleLength', () => {
    const longTitle = 'A'.repeat(100);
    const taskWithLongTitle: Task = {
      ...mockTask,
      title: longTitle,
    };

    fixture.componentRef.setInput('task', taskWithLongTitle);
    fixture.detectChanges();

    const truncated = component.truncatedTitle();
    expect(truncated.length).toBeLessThanOrEqual(component.maxTitleLength + 3);
    expect(truncated).toContain('...');
  });

  it('should not truncate title when shorter than maxTitleLength', () => {
    const shortTitle = 'Short Title';
    const taskWithShortTitle: Task = {
      ...mockTask,
      title: shortTitle,
    };

    fixture.componentRef.setInput('task', taskWithShortTitle);
    fixture.detectChanges();

    const truncated = component.truncatedTitle();
    expect(truncated).toBe(shortTitle);
    expect(truncated).not.toContain('...');
  });

  it('should navigate to task details when goToDetails is called', () => {
    component.goToDetails();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks', '1']);
  });

  it('should handle missing task gracefully in goToDetails', () => {
    // Task is required input, so we test with an invalid task structure instead
    const invalidTask = { id: '', title: '', status: 'Pending' as TaskStatus, createdAt: new Date(), updatedAt: new Date() };
    fixture.componentRef.setInput('task', invalidTask);
    fixture.detectChanges();

    component.goToDetails();
    // Should still attempt navigation, just with empty id
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should handle title exactly at maxTitleLength', () => {
    const exactLengthTitle = 'A'.repeat(component.maxTitleLength);
    const taskWithExactTitle: Task = {
      ...mockTask,
      title: exactLengthTitle,
    };

    fixture.componentRef.setInput('task', taskWithExactTitle);
    fixture.detectChanges();

    const truncated = component.truncatedTitle();
    expect(truncated).toBe(exactLengthTitle);
    expect(truncated).not.toContain('...');
  });
});
