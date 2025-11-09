import { ErrorHandler, inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';

export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);
  handleError(error: unknown): void {
    this.logger.error('Unhandled error', error);
  }
}
