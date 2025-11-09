import { signal, computed, effect, Injectable } from '@angular/core';

export interface Order {
  id: number;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  total: number;
  createdAt: string;
}

export interface OrdersState {
  items: Order[];
  selectedId: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Orders state store using Angular signals.
 * Provides reactive state management without external dependencies.
 */
@Injectable({ providedIn: 'root' })
export class OrdersStore {
  // Signals for mutable state
  private readonly state = signal<OrdersState>({
    items: [],
    selectedId: null,
    loading: false,
    error: null
  });

  // Expose state signals as read-only
  readonly items = computed(() => this.state().items);
  readonly selectedId = computed(() => this.state().selectedId);
  readonly loading = computed(() => this.state().loading);
  readonly error = computed(() => this.state().error);

  // Computed derived state
  readonly selectedOrder = computed(() => {
    const items = this.items();
    const id = this.selectedId();
    return id !== null ? items.find(o => o.id === id) ?? null : null;
  });

  readonly totalOrders = computed(() => this.items().length);
  readonly completedOrders = computed(() =>
    this.items().filter(o => o.status === 'completed').length
  );
  readonly pendingOrders = computed(() =>
    this.items().filter(o => o.status === 'pending').length
  );

  constructor() {
    // Side effect: log state changes in dev mode
    if (!this.isProduction()) {
      effect(() => {
        const s = this.state();
        console.log('[OrdersStore] State updated:', s);
      });
    }
  }

  // State mutations
  setItems(items: Order[]): void {
    this.state.update(s => ({ ...s, items, error: null }));
  }

  addItem(order: Order): void {
    this.state.update(s => ({
      ...s,
      items: [...s.items, order]
    }));
  }

  updateItem(id: number, updates: Partial<Order>): void {
    this.state.update(s => ({
      ...s,
      items: s.items.map(o => (o.id === id ? { ...o, ...updates } : o))
    }));
  }

  removeItem(id: number): void {
    this.state.update(s => ({
      ...s,
      items: s.items.filter(o => o.id !== id),
      selectedId: s.selectedId === id ? null : s.selectedId
    }));
  }

  selectOrder(id: number | null): void {
    this.state.update(s => ({ ...s, selectedId: id }));
  }

  setLoading(loading: boolean): void {
    this.state.update(s => ({ ...s, loading }));
  }

  setError(error: string | null): void {
    this.state.update(s => ({ ...s, error }));
  }

  reset(): void {
    this.state.set({
      items: [],
      selectedId: null,
      loading: false,
      error: null
    });
  }

  private isProduction(): boolean {
    return typeof window !== 'undefined' && (window as any).ngDevMode === false;
  }
}
