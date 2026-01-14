import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmationModal } from './confirmation-modal';

describe('ConfirmationModal', () => {
  let component: ConfirmationModal;
  let fixture: ComponentFixture<ConfirmationModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmationModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmationModal);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Title');
    fixture.componentRef.setInput('message', 'Test Message');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit true when confirmDelete is called', () => {
    const emitSpy = vi.spyOn(component.deleteResponse, 'emit');
    component.confirmDelete();
    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('should emit false when closeModal is called', () => {
    const emitSpy = vi.spyOn(component.deleteResponse, 'emit');
    component.closeModal();
    expect(emitSpy).toHaveBeenCalledWith(false);
  });

  it('should display the provided title', () => {
    fixture.componentRef.setInput('title', 'Delete Task');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Delete Task');
  });

  it('should display the provided message', () => {
    fixture.componentRef.setInput('message', 'Are you sure?');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Are you sure?');
  });
});
