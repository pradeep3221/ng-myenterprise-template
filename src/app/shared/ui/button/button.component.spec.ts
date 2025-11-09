import { TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  it('emits clicked when button is clicked', () => {
    TestBed.configureTestingModule({ imports: [ButtonComponent] });
    const fixture = TestBed.createComponent(ButtonComponent);
    fixture.detectChanges();
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => (emitted = true));
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(emitted).toBeTrue();
  });
});
