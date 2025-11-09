import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { customValidators } from '../validators/custom-validators';
import { FormValidatorService } from '../validators/form-validator.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
      <h2>Login</h2>

      <!-- Email Field -->
      <mat-form-field appearance="fill" class="form-field">
        <mat-label>Email</mat-label>
        <input matInput formControlName="email" type="email" />
        @if (isFieldInvalid('email')) {
          <mat-error>{{ getFieldError('email') }}</mat-error>
        }
      </mat-form-field>

      <!-- Password Field -->
      <mat-form-field appearance="fill" class="form-field">
        <mat-label>Password</mat-label>
        <input matInput formControlName="password" type="password" />
        @if (isFieldInvalid('password')) {
          <mat-error>{{ getFieldError('password') }}</mat-error>
        }
      </mat-form-field>

      <!-- Submit Button -->
      <button
        mat-raised-button
        color="primary"
        type="submit"
        [disabled]="!loginForm.valid || isSubmitting"
        class="submit-button"
      >
        @if (isSubmitting) {
          <mat-spinner diameter="20"></mat-spinner>
          <span>Logging in...</span>
        } @else {
          <span>Login</span>
        }
      </button>

      <!-- Success Message -->
      @if (loginSuccess) {
        <div class="success-message">
          ✓ Login successful!
        </div>
      }
    </form>
  `,
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 400px;
      margin: 32px auto;
      padding: 24px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    h2 {
      margin-top: 0;
      text-align: center;
    }

    .form-field {
      width: 100%;
    }

    .submit-button {
      margin-top: 16px;
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
    }

    .success-message {
      padding: 12px;
      background: #e8f5e9;
      color: #2e7d32;
      border-radius: 4px;
      text-align: center;
      font-weight: 500;
    }

    mat-error {
      font-size: 12px;
    }
  `]
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private formValidator = inject(FormValidatorService);

  loginForm: FormGroup;
  isSubmitting = false;
  loginSuccess = false;

  constructor() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [customValidators.required(), customValidators.email()]
      ],
      password: [
        '',
        [customValidators.required(), customValidators.minLength(6), customValidators.maxLength(128)]
      ]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.loginForm.get(fieldName);
    return this.formValidator.isInvalid(control as FormGroup);
  }

  getFieldError(fieldName: string): string | null {
    const control = this.loginForm.get(fieldName);
    return this.formValidator.getErrorMessage(control as FormGroup, fieldName);
  }

  onSubmit(): void {
    if (!this.formValidator.canSubmit(this.loginForm)) {
      this.formValidator.markAllAsTouched(this.loginForm);
      return;
    }

    const { email, password } = this.loginForm.value;
    console.log('Login submitted:', { email });

    this.isSubmitting = true;
    // Simulate API call
    setTimeout(() => {
      this.isSubmitting = false;
      this.loginSuccess = true;
      setTimeout(() => {
        this.loginSuccess = false;
        this.formValidator.resetForm(this.loginForm);
      }, 3000);
    }, 1500);
  }
}
