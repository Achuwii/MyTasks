import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TasksService } from '../../services/tasks.service';
import { TaskForm, TaskFormValue } from '../task-form/task-form';
import { ConfirmationModal } from '../../../shared/components/confirmation-modal/confirmation-modal';
import { TaskStatusComponent } from '../task-status/task-status';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-task-details',
  imports: [TaskForm, ConfirmationModal, TaskStatusComponent, DatePipe],
  templateUrl: './task-details.html',
  styleUrl: './task-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetails {
  router = inject(Router);
  route = inject(ActivatedRoute);
  tasksService = inject(TasksService);

  isEditModalOpen = signal<boolean>(false);
  isDeleteModalOpen = signal<boolean>(false);

  task = computed(() => {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return null;
    }

    return this.tasksService.tasks().find((task) => task.id === id) ?? null;
  });

  goToHome(): void {
    this.router.navigate(['/']);
  }

  openDeleteModal(): void {
    this.isDeleteModalOpen.set(true);
  }

  onDeleteConfirm(confirm: boolean): void {
    if (confirm) {
      const currentTask = this.task();
      if (!currentTask) {
        return;
      }

      this.tasksService.deleteTask(currentTask.id);
      this.isDeleteModalOpen.set(false);
      this.router.navigate(['/']);
    } else {
      this.isDeleteModalOpen.set(false);
    }
  }

  getDeleteMessage(taskTitle: string): string {
    return `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`;
  }

  openEditModal(): void {
    this.isEditModalOpen.set(true);
  }

  editTask(formValue: TaskFormValue): void {
    const currentTask = this.task();
    if (!currentTask) {
      return;
    }

    this.tasksService.updateTask(currentTask.id, {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
    });

    this.isEditModalOpen.set(false);
  }
}


