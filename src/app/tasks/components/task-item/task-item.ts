import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { Task } from '../../interface/task.interface';
import { TaskStatusComponent } from '../task-status/task-status';

@Component({
  selector: 'app-task-item',
  imports: [TaskStatusComponent],
  templateUrl: './task-item.html',
  styleUrl: './task-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskItem {
  router = inject(Router);

  task = input.required<Task>();
  maxTitleLength = window.innerWidth > 767 ? 50 : 25;


  truncatedTitle = computed(() => {
    const currentTask = this.task();
    if (!currentTask) {
      return '';
    }

    return `${currentTask.title.slice(0, this.maxTitleLength)}${currentTask.title.length > this.maxTitleLength ? '...' : ''}`;
  });

  goToDetails(): void {
    const currentTask = this.task();
    if (!currentTask) {
      return;
    }

    this.router.navigate(['/tasks', currentTask.id]);
  }
}