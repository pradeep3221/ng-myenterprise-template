import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

/**
 * Form validation utilities service.
 * Provides helper methods for working with form controls and errors.
 */
@Injectable({ providedIn: 'root' })
export class FormValidatorService {
  /**
   * Get human-readable error message for a form control.
   */
  getErrorMessage(control: AbstractControl | null, fieldName: string): string | null {
    if (!control || !control.errors) return null;

    const errors = control.errors;

    if (errors['required']) return `${fieldName} is required`;
    if (errors['email']) return `${fieldName} must be a valid email`;
    if (errors['minLength']) return `${fieldName} must be at least ${errors['minLength'].requiredLength} characters`;
    if (errors['maxLength']) return `${fieldName} must not exceed ${errors['maxLength'].requiredLength} characters`;
    if (errors['pattern']) return `${fieldName} format is invalid`;
    if (errors['range']) return `${fieldName} must be between ${errors['range'].min} and ${errors['range'].max}`;
    if (errors['url']) return `${fieldName} must be a valid URL`;
    if (errors['phone']) return `${fieldName} must be a valid phone number`;
    if (errors['fieldsMatch']) return `${errors['fieldsMatch'].field1} and ${errors['fieldsMatch'].field2} do not match`;
    if (errors['asyncAvailable']) return `${fieldName} is not available`;
    if (errors['customError']) return errors['customError'];

    return 'Invalid input';
  }

  /**
   * Check if a form control is invalid and touched/dirty.
   */
  isInvalid(control: AbstractControl | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  /**
   * Get all error messages for a form group.
   */
  getFormErrors(form: FormGroup): { [key: string]: string } {
    const errors: { [key: string]: string } = {};
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        const msg = this.getErrorMessage(control, this.humanizeFieldName(key));
        if (msg) errors[key] = msg;
      }
    });
    return errors;
  }

  /**
   * Check if entire form is invalid (ignoring pristine state).
   */
  isFormInvalid(form: FormGroup): boolean {
    return form.invalid;
  }

  /**
   * Check if form is valid and can be submitted.
   */
  canSubmit(form: FormGroup): boolean {
    return form.valid;
  }

  /**
   * Mark all controls as touched (to show validation errors).
   */
  markAllAsTouched(form: FormGroup): void {
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markAllAsTouched(control);
        }
      }
    });
  }

  /**
   * Reset form to pristine state.
   */
  resetForm(form: FormGroup): void {
    form.reset();
  }

  /**
   * Convert camelCase field name to Title Case (e.g., firstName -> First Name).
   */
  private humanizeFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  }

  /**
   * Validate a single field and return error message if invalid.
   */
  validateField(control: AbstractControl | null, fieldName: string): string | null {
    return this.isInvalid(control) ? this.getErrorMessage(control, fieldName) : null;
  }
}
