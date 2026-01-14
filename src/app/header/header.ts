import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TasksService } from '../tasks/services/tasks.service';
import { TaskForm, TaskFormValue } from '../tasks/components/task-form/task-form';
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: 'app-header',
  imports: [TaskForm, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Header {
  private tasksService = inject(TasksService);
  private router = inject(Router);
  
  isAddModalOpen = signal<boolean>(false);

  openAddModal(): void {
    this.isAddModalOpen.set(true);
  }

  closeAddModal(): void {
    this.isAddModalOpen.set(false);
  }

  addTask(formValue: TaskFormValue): void {
    this.tasksService.addTask({
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
    });
    this.isAddModalOpen.set(false);
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }

}
