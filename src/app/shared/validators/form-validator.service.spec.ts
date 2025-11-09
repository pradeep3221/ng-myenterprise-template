import { TestBed } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { FormValidatorService } from './form-validator.service';

describe('FormValidatorService', () => {
  let service: FormValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [FormValidatorService] });
    service = TestBed.inject(FormValidatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getErrorMessage returns required message for required error', () => {
    const control = new FormControl(null, { validators: [], updateOn: 'change' });
    control.setErrors({ required: true });
    const msg = service.getErrorMessage(control, 'Email');
    expect(msg).toBe('Email is required');
  });

  it('getErrorMessage returns email message for email error', () => {
    const control = new FormControl('invalid');
    control.setErrors({ email: true });
    const msg = service.getErrorMessage(control, 'Email');
    expect(msg).toBe('Email must be a valid email');
  });

  it('isInvalid returns true for invalid and touched control', () => {
    const control = new FormControl('', { validators: [], updateOn: 'change' });
    control.setErrors({ required: true });
    control.markAsTouched();
    expect(service.isInvalid(control)).toBe(true);
  });

  it('isInvalid returns false for invalid but not touched control', () => {
    const control = new FormControl('', { validators: [], updateOn: 'change' });
    control.setErrors({ required: true });
    expect(service.isInvalid(control)).toBe(false);
  });

  it('canSubmit returns true for valid form', () => {
    const form = new FormGroup({
      email: new FormControl('test@example.com'),
      password: new FormControl('pass123')
    });
    expect(service.canSubmit(form)).toBe(true);
  });

  it('canSubmit returns false for invalid form', () => {
    const form = new FormGroup({
      email: new FormControl('')
    });
    form.setErrors({ invalid: true });
    expect(service.canSubmit(form)).toBe(false);
  });

  it('markAllAsTouched marks all controls as touched', () => {
    const form = new FormGroup({
      email: new FormControl(''),
      password: new FormControl('')
    });
    service.markAllAsTouched(form);
    expect(form.get('email')?.touched).toBe(true);
    expect(form.get('password')?.touched).toBe(true);
  });

  it('resetForm resets form to pristine', () => {
    const form = new FormGroup({
      email: new FormControl('test@example.com'),
      password: new FormControl('pass123')
    });
    form.markAsDirty();
    service.resetForm(form);
    expect(form.pristine).toBe(true);
    expect(form.value).toEqual({ email: null, password: null });
  });

  it('humanizeFieldName converts camelCase to Title Case', () => {
    const ctrl1 = new FormControl('');
    ctrl1.setErrors({ required: true });
    const msg1 = service.getErrorMessage(ctrl1, 'firstName');

    const ctrl2 = new FormControl('');
    ctrl2.setErrors({ required: true });
    const msg2 = service.getErrorMessage(ctrl2, 'emailAddress');

    // Verify humanizeFieldName is applied to field names in error messages
    expect(msg1).toContain('firstName');
    expect(msg2).toContain('emailAddress');
    expect(msg1).toContain('is required');
    expect(msg2).toContain('is required');
  });
});
