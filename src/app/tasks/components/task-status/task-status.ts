import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TaskStatus } from '../../interface/task.interface';

@Component({
  selector: 'app-task-status',
  templateUrl: './task-status.html',
  styleUrl: './task-status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskStatusComponent {
  status = input.required<TaskStatus>();

  statusClass = computed(() => {
    const currentStatus = this.status();
    switch (currentStatus) {
      case 'Pending':
        return 'task-status--pending';
      case 'In Progress':
        return 'task-status--in-progress';
      case 'Done':
        return 'task-status--done';
      default:
        return '';
    }
  });
}
