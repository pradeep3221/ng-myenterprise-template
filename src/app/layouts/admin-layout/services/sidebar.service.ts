import { Injectable, signal } from '@angular/core';

/**
 * Service to manage sidebar state using Angular Signals
 * Handles responsive sidebar visibility on different screen sizes
 */
@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Private signal for sidebar open/closed state
  private readonly sidebarOpenSignal = signal<boolean>(true);

  // Public read-only computed signal
  readonly sidebarOpen = this.sidebarOpenSignal.asReadonly();

  /**
   * Toggle sidebar visibility
   */
  toggleSidebar(): void {
    this.sidebarOpenSignal.update(open => !open);
  }

  /**
   * Explicitly set sidebar state
   */
  setSidebarOpen(open: boolean): void {
    this.sidebarOpenSignal.set(open);
  }

  /**
   * Close sidebar (e.g., on route navigation in mobile view)
   */
  closeSidebar(): void {
    this.sidebarOpenSignal.set(false);
  }

  /**
   * Open sidebar
   */
  openSidebar(): void {
    this.sidebarOpenSignal.set(true);
  }
}
