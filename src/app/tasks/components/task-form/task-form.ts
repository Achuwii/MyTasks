import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';
import { Task, TaskStatus } from '../../interface/task.interface';
import { CustomSelect, SelectOption } from '../../../shared/components/custom-select/custom-select';

export interface TaskFormValue {
  title: string;
  description: string;
  status: TaskStatus;
}

interface TaskFormModel {
  title: string;
  description: string;
  status: TaskStatus;
}

@Component({
  selector: 'app-task-form',
  imports: [FormField, CustomSelect],
  templateUrl: './task-form.html',
  styleUrl: './task-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskForm {
  mode = input<'add' | 'edit'>('add');
  task = input<Task | null>(null);

  submitted = output<TaskFormValue>();
  cancelled = output<void>();

  formModel = signal<TaskFormModel>({
    title: '',
    description: '',
    status: 'Pending',
  });

  taskForm = form(this.formModel, (schemaPath) => {
    required(schemaPath.title);
  });

  statusOptions: SelectOption[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
  ];

  constructor() {
    effect(() => {
      const currentTask = this.task();

      if (!currentTask) {
        this.formModel.set({
          title: '',
          description: '',
          status: 'Pending',
        });
        return;
      }

      this.formModel.set({
        title: currentTask.title,
        description: currentTask.description ?? '',
        status: currentTask.status,
      });
    });
  }

  submitForm(): void {
    const formValue = this.formModel();
    const trimmedTitle = formValue.title.trim();

    if (!trimmedTitle) {
      return;
    }

    this.submitted.emit({
      title: trimmedTitle,
      description: formValue.description.trim(),
      status: formValue.status,
    });
  }

  cancel(): void {
    this.cancelled.emit();
  }

  onStatusChange(value: string): void {
    this.formModel.update((model) => ({
      ...model,
      status: value as TaskStatus,
    }));
  }
}


