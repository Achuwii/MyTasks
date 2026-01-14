import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.html',
  styleUrl: './confirmation-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationModal {
  title = input.required<string>();
  message = input.required<string>();

  deleteResponse = output<boolean>();
  cancelled = output<void>();

  confirmDelete(): void {
    this.deleteResponse.emit(true);
  }

  closeModal(): void {
    this.deleteResponse.emit(false);
  }
}

