import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pagination {
  currentPage = input.required<number>();
  totalPages = input.required<number>();

  pageChange = output<number>();

  showPagination = computed(() => this.totalPages() > 1);

  pageNumbers = computed(() => {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pages: number[] = [];

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  });

  showFirstPage = computed(() => {
    return this.currentPage() > 3 && this.totalPages() > 5;
  });

  showFirstEllipsis = computed(() => {
    return this.currentPage() > 4 && this.totalPages() > 5;
  });

  showLastPage = computed(() => {
    return (
      this.currentPage() < this.totalPages() - 2 && this.totalPages() > 5
    );
  });

  showLastEllipsis = computed(() => {
    return (
      this.currentPage() < this.totalPages() - 3 &&
      this.totalPages() > 5
    );
  });

  isPreviousDisabled = computed(() => this.currentPage() === 1);
  isNextDisabled = computed(
    () => this.currentPage() === this.totalPages()
  );

  setCurrentPage(page: number): void {
    this.pageChange.emit(page);
  }

  handlePrevious(): void {
    if (!this.isPreviousDisabled()) {
      this.pageChange.emit(this.currentPage() - 1);
    }
  }

  handleNext(): void {
    if (!this.isNextDisabled()) {
      this.pageChange.emit(this.currentPage() + 1);
    }
  }

  isPageActive(page: number): boolean {
    return page === this.currentPage();
  }
}
