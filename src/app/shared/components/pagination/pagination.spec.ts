import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Pagination } from './pagination';

describe('Pagination', () => {
  let component: Pagination;
  let fixture: ComponentFixture<Pagination>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pagination],
    }).compileComponents();

    fixture = TestBed.createComponent(Pagination);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show pagination when totalPages > 1', () => {
    fixture.componentRef.setInput('totalPages', 5);
    fixture.detectChanges();
    expect(component.showPagination()).toBe(true);
  });

  it('should hide pagination when totalPages <= 1', () => {
    fixture.componentRef.setInput('totalPages', 1);
    fixture.detectChanges();
    expect(component.showPagination()).toBe(false);
  });

  it('should calculate page numbers correctly for middle pages', () => {
    fixture.componentRef.setInput('currentPage', 5);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    const pages = component.pageNumbers();
    expect(pages).toEqual([3, 4, 5, 6, 7]);
  });

  it('should calculate page numbers correctly for first pages', () => {
    fixture.componentRef.setInput('currentPage', 1);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    const pages = component.pageNumbers();
    expect(pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('should calculate page numbers correctly for last pages', () => {
    fixture.componentRef.setInput('currentPage', 10);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    const pages = component.pageNumbers();
    expect(pages).toEqual([6, 7, 8, 9, 10]);
  });

  it('should show first page when currentPage > 3 and totalPages > 5', () => {
    fixture.componentRef.setInput('currentPage', 5);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.showFirstPage()).toBe(true);
  });

  it('should not show first page when currentPage <= 3', () => {
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.showFirstPage()).toBe(false);
  });

  it('should show first ellipsis when currentPage > 4 and totalPages > 5', () => {
    fixture.componentRef.setInput('currentPage', 6);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.showFirstEllipsis()).toBe(true);
  });

  it('should show last page when currentPage < totalPages - 2 and totalPages > 5', () => {
    fixture.componentRef.setInput('currentPage', 5);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.showLastPage()).toBe(true);
  });

  it('should show last ellipsis when currentPage < totalPages - 3 and totalPages > 5', () => {
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.showLastEllipsis()).toBe(true);
  });

  it('should disable previous button on first page', () => {
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();

    expect(component.isPreviousDisabled()).toBe(true);
  });

  it('should enable previous button when not on first page', () => {
    fixture.componentRef.setInput('currentPage', 2);
    fixture.detectChanges();

    expect(component.isPreviousDisabled()).toBe(false);
  });

  it('should disable next button on last page', () => {
    fixture.componentRef.setInput('currentPage', 10);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.isNextDisabled()).toBe(true);
  });

  it('should enable next button when not on last page', () => {
    fixture.componentRef.setInput('currentPage', 5);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();

    expect(component.isNextDisabled()).toBe(false);
  });

  it('should emit page number when setCurrentPage is called', () => {
    const emitSpy = vi.spyOn(component.pageChange, 'emit');
    component.setCurrentPage(5);
    expect(emitSpy).toHaveBeenCalledWith(5);
  });

  it('should emit previous page when handlePrevious is called and not disabled', () => {
    fixture.componentRef.setInput('currentPage', 3);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.pageChange, 'emit');

    component.handlePrevious();

    expect(emitSpy).toHaveBeenCalledWith(2);
  });

  it('should not emit when handlePrevious is called and disabled', () => {
    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.pageChange, 'emit');

    component.handlePrevious();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should emit next page when handleNext is called and not disabled', () => {
    fixture.componentRef.setInput('currentPage', 3);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.pageChange, 'emit');

    component.handleNext();

    expect(emitSpy).toHaveBeenCalledWith(4);
  });

  it('should not emit when handleNext is called and disabled', () => {
    fixture.componentRef.setInput('currentPage', 10);
    fixture.componentRef.setInput('totalPages', 10);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.pageChange, 'emit');

    component.handleNext();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should check if page is active', () => {
    fixture.componentRef.setInput('currentPage', 5);
    fixture.detectChanges();

    expect(component.isPageActive(5)).toBe(true);
    expect(component.isPageActive(4)).toBe(false);
  });
});
