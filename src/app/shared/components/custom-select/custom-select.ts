import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  imports: [CommonModule],
  templateUrl: './custom-select.html',
  styleUrl: './custom-select.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomSelect {
  elementRef = inject(ElementRef);

  options = input.required<SelectOption[]>();
  value = input<string>('');
  id = input<string>('');

  valueChange = output<string>();

  isOpen = signal<boolean>(false);
  focusedIndex = signal<number>(-1);

  selectedOption = computed(() => {
    const currentValue = this.value();
    return (
      this.options().find((option) => option.value === currentValue) ?? null
    );
  });

  displayText = computed(() => {
    return this.selectedOption()?.label ?? '';
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        this.focusedIndex.set(-1);
        document.removeEventListener('click', this.onDocumentClick);
      } else {
        setTimeout(() => {
          document.addEventListener('click', this.onDocumentClick);
        }, 0);
      }
    });
  }

  onDocumentClick = (event: MouseEvent): void => {
    const target = event.target as Node;
    const element = this.elementRef.nativeElement;

    if (!element.contains(target)) {
      this.isOpen.set(false);
      this.focusedIndex.set(-1);
      document.removeEventListener('click', this.onDocumentClick);
    }
  };

  toggleDropdown(): void {
    this.isOpen.update((open) => !open);
  }

  selectOption(option: SelectOption): void {
    this.valueChange.emit(option.value);
    this.isOpen.set(false);
    this.focusedIndex.set(-1);
    document.removeEventListener('click', this.onDocumentClick);
  }

  isOptionFocused(index: number): boolean {
    return this.focusedIndex() === index;
  }

  isOptionSelected(option: SelectOption): boolean {
    return option.value === this.value();
  }
}
