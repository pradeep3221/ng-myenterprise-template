import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

/**
 * Reusable validators for reactive forms.
 * All validators return ValidationErrors or null.
 */

export const customValidators = {
  /**
   * Validates required field (non-empty, non-whitespace string).
   */
  required: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || (typeof value === 'string' && !value.trim())) {
        return { required: true };
      }
      return null;
    };
  },

  /**
   * Validates minimum string length.
   */
  minLength: (min: number): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = String(control.value);
      return value.length < min ? { minLength: { requiredLength: min, actualLength: value.length } } : null;
    };
  },

  /**
   * Validates maximum string length.
   */
  maxLength: (max: number): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = String(control.value);
      return value.length > max ? { maxLength: { requiredLength: max, actualLength: value.length } } : null;
    };
  },

  /**
   * Validates email format.
   */
  email: (): ValidatorFn => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return emailRegex.test(String(control.value)) ? null : { email: true };
    };
  },

  /**
   * Validates pattern match.
   */
  pattern: (pattern: RegExp | string, errorName = 'pattern'): ValidatorFn => {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return regex.test(String(control.value)) ? null : { [errorName]: true };
    };
  },

  /**
   * Validates number is within range [min, max].
   */
  range: (min: number, max: number): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value && control.value !== 0) return null;
      const num = Number(control.value);
      if (isNaN(num)) return { range: true };
      return num >= min && num <= max ? null : { range: { min, max, actual: num } };
    };
  },

  /**
   * Validates two fields match (e.g., password confirmation).
   * Applied to parent FormGroup.
   */
  matchFields: (field1: string, field2: string): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      const group = control as any;
      if (!group.get || !group.get(field1) || !group.get(field2)) return null;
      const val1 = group.get(field1).value;
      const val2 = group.get(field2).value;
      return val1 === val2 ? null : { fieldsMatch: { field1, field2 } };
    };
  },

  /**
   * Validates URL format.
   */
  url: (): ValidatorFn => {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      try {
        new URL(String(control.value));
        return null;
      } catch {
        return { url: true };
      }
    };
  },

  /**
   * Validates phone number (basic: digits, hyphens, spaces, +).
   */
  phone: (): ValidatorFn => {
    const phoneRegex = /^[+]?[\d\s\-()]+$/;
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      const value = String(control.value);
      return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 7
        ? null
        : { phone: true };
    };
  },

  /**
   * Async validator for checking value availability (e.g., username uniqueness).
   * Pass a function that returns Promise<boolean> (true = available, false = taken).
   */
  asyncAvailable: (checkFn: (value: string) => Promise<boolean>): AsyncValidatorFn => {
    return (control: AbstractControl) => {
      if (!control.value) return Promise.resolve(null);
      return checkFn(String(control.value)).then(isAvailable => {
        return isAvailable ? null : { asyncAvailable: { value: control.value } };
      });
    };
  }
};
