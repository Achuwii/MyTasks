import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskForm, TaskFormValue } from './task-form';
import { Task, TaskStatus } from '../../interface/task.interface';

describe('TaskForm', () => {
  let component: TaskForm;
  let fixture: ComponentFixture<TaskForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    const formModel = component.formModel();
    expect(formModel.title).toBe('');
    expect(formModel.description).toBe('');
    expect(formModel.status).toBe('Pending');
  });

  it('should initialize form in add mode by default', () => {
    expect(component.mode()).toBe('add');
  });

  it('should update form model when task input changes', () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'In Progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();

    const formModel = component.formModel();
    expect(formModel.title).toBe('Test Task');
    expect(formModel.description).toBe('Test Description');
    expect(formModel.status).toBe('In Progress');
  });

  it('should reset form when task is set to null', () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      status: 'In Progress',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();

    fixture.componentRef.setInput('task', null);
    fixture.detectChanges();

    const formModel = component.formModel();
    expect(formModel.title).toBe('');
    expect(formModel.description).toBe('');
    expect(formModel.status).toBe('Pending');
  });

  it('should handle task with undefined description', () => {
    const mockTask: Task = {
      id: '1',
      title: 'Test Task',
      status: 'Pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    fixture.componentRef.setInput('task', mockTask);
    fixture.detectChanges();

    const formModel = component.formModel();
    expect(formModel.description).toBe('');
  });

  it('should emit submitted event with trimmed values', () => {
    const emitSpy = vi.spyOn(component.submitted, 'emit');
    component.formModel.set({
      title: '  Test Task  ',
      description: '  Test Description  ',
      status: 'Done',
    });

    component.submitForm();

    expect(emitSpy).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
      status: 'Done',
    });
  });

  it('should not submit when title is empty', () => {
    const emitSpy = vi.spyOn(component.submitted, 'emit');
    component.formModel.set({
      title: '   ',
      description: 'Description',
      status: 'Pending',
    });

    component.submitForm();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not submit when title is only whitespace', () => {
    const emitSpy = vi.spyOn(component.submitted, 'emit');
    component.formModel.set({
      title: '\t\n',
      description: 'Description',
      status: 'Pending',
    });

    component.submitForm();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit cancelled event when cancel is called', () => {
    const emitSpy = vi.spyOn(component.cancelled, 'emit');
    component.cancel();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should update status when onStatusChange is called', () => {
    component.formModel.set({
      title: 'Test Task',
      description: 'Description',
      status: 'Pending',
    });

    component.onStatusChange('Done');

    const formModel = component.formModel();
    expect(formModel.status).toBe('Done');
    expect(formModel.title).toBe('Test Task');
    expect(formModel.description).toBe('Description');
  });

  it('should have correct status options', () => {
    expect(component.statusOptions).toEqual([
      { value: 'Pending', label: 'Pending' },
      { value: 'In Progress', label: 'In Progress' },
      { value: 'Done', label: 'Done' },
    ]);
  });

  // Form validation is tested indirectly through submitForm tests
  // which verify that empty titles prevent submission
});
