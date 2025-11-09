import { inject, Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/app-config.token';
import type { LogLevel } from '../config/types';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private config = inject(APP_CONFIG);
  private levelOrder: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40, silent: 100 };

  private allowed(level: LogLevel): boolean {
    // Log when the requested level is equal or higher severity than configured threshold.
    return this.levelOrder[level] >= this.levelOrder[this.config.logLevel];
  }

  debug(message: string, ...args: unknown[]) {
  if (this.config.logLevel === 'silent' || !this.allowed('debug')) return;
    console.debug('[DEBUG]', message, ...args);
  }
  info(message: string, ...args: unknown[]) {
  if (this.config.logLevel === 'silent' || !this.allowed('info')) return;
    console.info('[INFO]', message, ...args);
  }
  warn(message: string, ...args: unknown[]) {
  if (this.config.logLevel === 'silent' || !this.allowed('warn')) return;
    console.warn('[WARN]', message, ...args);
  }
  error(message: string, error?: unknown) {
  if (this.config.logLevel === 'silent' || !this.allowed('error')) return;
    console.error('[ERROR]', message, error);
  }
}
