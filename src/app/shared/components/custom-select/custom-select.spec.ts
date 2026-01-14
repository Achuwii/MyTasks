import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomSelect, SelectOption } from './custom-select';

describe('CustomSelect', () => {
  let component: CustomSelect;
  let fixture: ComponentFixture<CustomSelect>;
  const mockOptions: SelectOption[] = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomSelect],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomSelect);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('options', mockOptions);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with dropdown closed', () => {
    expect(component.isOpen()).toBe(false);
  });

  it('should toggle dropdown when toggleDropdown is called', () => {
    component.toggleDropdown();
    expect(component.isOpen()).toBe(true);

    component.toggleDropdown();
    expect(component.isOpen()).toBe(false);
  });

  it('should display selected option label', () => {
    fixture.componentRef.setInput('value', 'option1');
    fixture.detectChanges();
    expect(component.displayText()).toBe('Option 1');
  });

  it('should return empty string when no option is selected', () => {
    fixture.componentRef.setInput('value', '');
    fixture.detectChanges();
    expect(component.displayText()).toBe('');
  });

  it('should emit value when option is selected', () => {
    const emitSpy = vi.spyOn(component.valueChange, 'emit');
    const option: SelectOption = { value: 'option2', label: 'Option 2' };

    component.selectOption(option);

    expect(emitSpy).toHaveBeenCalledWith('option2');
    expect(component.isOpen()).toBe(false);
  });

  it('should close dropdown and reset focus when option is selected', () => {
    component.isOpen.set(true);
    component.focusedIndex.set(1);
    const option: SelectOption = { value: 'option2', label: 'Option 2' };

    component.selectOption(option);

    expect(component.isOpen()).toBe(false);
    expect(component.focusedIndex()).toBe(-1);
  });

  it('should check if option is selected', () => {
    fixture.componentRef.setInput('value', 'option1');
    fixture.detectChanges();

    const option1: SelectOption = { value: 'option1', label: 'Option 1' };
    const option2: SelectOption = { value: 'option2', label: 'Option 2' };

    expect(component.isOptionSelected(option1)).toBe(true);
    expect(component.isOptionSelected(option2)).toBe(false);
  });

  it('should check if option is focused', () => {
    component.focusedIndex.set(1);
    expect(component.isOptionFocused(1)).toBe(true);
    expect(component.isOptionFocused(0)).toBe(false);
  });

  it('should close dropdown when clicking outside', () => {
    component.isOpen.set(true);
    const mockEvent = new MouseEvent('click');
    const mockElement = document.createElement('div');
    const mockTarget = document.createElement('div');

    vi.spyOn(component.elementRef.nativeElement, 'contains').mockReturnValue(false);

    component.onDocumentClick(mockEvent);

    expect(component.isOpen()).toBe(false);
    expect(component.focusedIndex()).toBe(-1);
  });

  it('should not close dropdown when clicking inside', () => {
    component.isOpen.set(true);
    const mockEvent = new MouseEvent('click');

    vi.spyOn(component.elementRef.nativeElement, 'contains').mockReturnValue(true);

    component.onDocumentClick(mockEvent);

    expect(component.isOpen()).toBe(true);
  });

  it('should compute selectedOption correctly', () => {
    fixture.componentRef.setInput('value', 'option2');
    fixture.detectChanges();

    const selected = component.selectedOption();
    expect(selected?.value).toBe('option2');
    expect(selected?.label).toBe('Option 2');
  });

  it('should return null when no option matches value', () => {
    fixture.componentRef.setInput('value', 'non-existent');
    fixture.detectChanges();

    expect(component.selectedOption()).toBeNull();
  });
});
