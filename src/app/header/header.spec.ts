import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Header } from './header';
import { TasksService } from '../tasks/services/tasks.service';
import { TaskFormValue } from '../tasks/components/task-form/task-form';
import { routes } from '../app.routes';

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let tasksService: TasksService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        TasksService,
        provideRouter(routes),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    tasksService = TestBed.inject(TasksService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with modal closed', () => {
    expect(component.isAddModalOpen()).toBe(false);
  });

  it('should open modal when openAddModal is called', () => {
    component.openAddModal();
    expect(component.isAddModalOpen()).toBe(true);
  });

  it('should close modal when closeAddModal is called', () => {
    component.openAddModal();
    component.closeAddModal();
    expect(component.isAddModalOpen()).toBe(false);
  });

  it('should add task and close modal when addTask is called', () => {
    const addTaskSpy = vi.spyOn(tasksService, 'addTask');
    const formValue: TaskFormValue = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'Pending',
    };

    component.openAddModal();
    component.addTask(formValue);

    expect(addTaskSpy).toHaveBeenCalledWith({
      title: 'Test Task',
      description: 'Test Description',
      status: 'Pending',
    });
    expect(component.isAddModalOpen()).toBe(false);
  });

  it('should navigate to home when goToHome is called', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.goToHome();
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
