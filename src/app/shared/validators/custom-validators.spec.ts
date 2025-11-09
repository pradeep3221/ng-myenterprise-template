import { customValidators } from './custom-validators';
import { FormControl, FormGroup } from '@angular/forms';

describe('customValidators', () => {
  it('required validator returns error for empty value', () => {
    const control = new FormControl('');
    const validator = customValidators.required();
    expect(validator(control)).toEqual({ required: true });
  });

  it('required validator passes for non-empty value', () => {
    const control = new FormControl('test');
    const validator = customValidators.required();
    expect(validator(control)).toBeNull();
  });

  it('minLength validator returns error when string too short', () => {
    const control = new FormControl('ab');
    const validator = customValidators.minLength(3);
    expect(validator(control)).toEqual({
      minLength: { requiredLength: 3, actualLength: 2 }
    });
  });

  it('maxLength validator returns error when string too long', () => {
    const control = new FormControl('toolong');
    const validator = customValidators.maxLength(5);
    expect(validator(control)).toEqual({
      maxLength: { requiredLength: 5, actualLength: 7 }
    });
  });

  it('email validator passes for valid email', () => {
    const control = new FormControl('test@example.com');
    const validator = customValidators.email();
    expect(validator(control)).toBeNull();
  });

  it('email validator returns error for invalid email', () => {
    const control = new FormControl('notanemail');
    const validator = customValidators.email();
    expect(validator(control)).toEqual({ email: true });
  });

  it('pattern validator matches pattern', () => {
    const control = new FormControl('ABC123');
    const validator = customValidators.pattern(/^[A-Z0-9]+$/);
    expect(validator(control)).toBeNull();
  });

  it('url validator validates URL format', () => {
    const validControl = new FormControl('https://example.com');
    const invalidControl = new FormControl('not a url');
    const validator = customValidators.url();
    expect(validator(validControl)).toBeNull();
    expect(validator(invalidControl)).toEqual({ url: true });
  });

  it('phone validator validates phone number', () => {
    const validControl = new FormControl('(123) 456-7890');
    const invalidControl = new FormControl('abc');
    const validator = customValidators.phone();
    expect(validator(validControl)).toBeNull();
    expect(validator(invalidControl)).toEqual({ phone: true });
  });

  it('range validator validates number in range', () => {
    const control = new FormControl(5);
    const validator = customValidators.range(1, 10);
    expect(validator(control)).toBeNull();

    const outOfRangeControl = new FormControl(15);
    expect(validator(outOfRangeControl)).toEqual({
      range: { min: 1, max: 10, actual: 15 }
    });
  });

  it('matchFields validator checks field equality', () => {
    const form = new FormGroup({
      password: new FormControl('pass123'),
      confirmPassword: new FormControl('pass123')
    });
    const validator = customValidators.matchFields('password', 'confirmPassword');
    expect(validator(form)).toBeNull();

    form.get('confirmPassword')?.setValue('different');
    expect(validator(form)).toEqual({
      fieldsMatch: { field1: 'password', field2: 'confirmPassword' }
    });
  });
});
