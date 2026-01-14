import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  HostListener,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { TasksService, SortOption } from './services/tasks.service';
import { TaskItem } from './components/task-item/task-item';
import { TaskStatus } from './interface/task.interface';
import { CustomSelect, SelectOption } from '../shared/components/custom-select/custom-select';
import { Pagination } from '../shared/components/pagination/pagination';

@Component({
  selector: 'app-tasks',
  imports: [TaskItem, CustomSelect, Pagination],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tasks {
  private tasksService = inject(TasksService);
  private elementRef = inject(ElementRef);

  tasks = this.tasksService.tasks;
  filteredTasks = this.tasksService.filteredTasks;
  searchTerm = this.tasksService.searchTerm;
  selectedStatuses = this.tasksService.selectedStatuses;
  sortType = this.tasksService.sortType;
  currentPage = this.tasksService.currentPage;
  totalPages = this.tasksService.totalPages;

  isFilterDropdownOpen = signal<boolean>(false);

  statuses: TaskStatus[] = ['Pending', 'In Progress', 'Done'];

  sortOptions: SelectOption[] = [
    { value: 'title-asc', label: 'Title (A-Z)' },
    { value: 'title-desc', label: 'Title (Z-A)' },
    { value: 'date-asc', label: 'Date (Oldest first)' },
    { value: 'date-desc', label: 'Date (Newest first)' },
    { value: 'status-asc', label: 'Status (Pending to Done)' },
    { value: 'status-desc', label: 'Status (Done to Pending)' },
  ];

  @ViewChild('filterDropdown', { read: ElementRef })
  filterDropdownRef?: ElementRef<HTMLElement>;

  onSearchChange(searchValue: string): void {
    this.tasksService.setSearchTerm(searchValue);
  }

  deleteTask(id: string): void {
    this.tasksService.deleteTask(id);
  }

  toggleFilterDropdown(): void {
    this.isFilterDropdownOpen.update((isOpen) => !isOpen);
  }

  closeFilterDropdown(): void {
    this.isFilterDropdownOpen.set(false);
  }

  filterTasksByStatus(status: TaskStatus): void {
    this.tasksService.filterTasksByStatus(status);
  }

  isStatusSelected(status: TaskStatus): boolean {
    return this.tasksService.isStatusSelected(status);
  }

  sortTasks(value: string): void {
    this.tasksService.setSortType(value as SortOption);
  }

  setCurrentPage(page: number): void {
    this.tasksService.setCurrentPage(page);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isFilterDropdownOpen()) {
      return;
    }

    const target = event.target as HTMLElement;
    const filterButton = this.elementRef.nativeElement.querySelector(
      '.tasks__actions-filter'
    ) as HTMLElement;
    const dropdown = this.filterDropdownRef?.nativeElement;

    const clickedOnFilterButton = filterButton?.contains(target);
    const clickedOnDropdown = dropdown?.contains(target);

    if (!clickedOnFilterButton && !clickedOnDropdown) {
      this.closeFilterDropdown();
    }
  }
}
