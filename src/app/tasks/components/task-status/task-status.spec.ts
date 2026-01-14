import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskStatusComponent } from './task-status';
import { TaskStatus } from '../../interface/task.interface';

describe('TaskStatusComponent', () => {
  let component: TaskStatusComponent;
  let fixture: ComponentFixture<TaskStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskStatusComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskStatusComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('status', 'Pending');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct class for Pending status', () => {
    fixture.componentRef.setInput('status', 'Pending');
    fixture.detectChanges();
    expect(component.statusClass()).toBe('task-status--pending');
  });

  it('should return correct class for In Progress status', () => {
    fixture.componentRef.setInput('status', 'In Progress');
    fixture.detectChanges();
    expect(component.statusClass()).toBe('task-status--in-progress');
  });

  it('should return correct class for Done status', () => {
    fixture.componentRef.setInput('status', 'Done');
    fixture.detectChanges();
    expect(component.statusClass()).toBe('task-status--done');
  });

  it('should return empty string for unknown status', () => {
    fixture.componentRef.setInput('status', 'Unknown' as TaskStatus);
    fixture.detectChanges();
    expect(component.statusClass()).toBe('');
  });

  it('should update class when status changes', () => {
    fixture.componentRef.setInput('status', 'Pending');
    fixture.detectChanges();
    expect(component.statusClass()).toBe('task-status--pending');

    fixture.componentRef.setInput('status', 'Done');
    fixture.detectChanges();
    expect(component.statusClass()).toBe('task-status--done');
  });
});
