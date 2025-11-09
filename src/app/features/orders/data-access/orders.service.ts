import { inject, Injectable } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';

export interface Order { id: string; number: string; total: number; }

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private api = inject(ApiService);

  list() {
    // Replace with: return this.api.get<Order[]>('/orders');
    return this.api.get<Order[]>('/orders');
  }

  byId(id: string) {
    // Replace with: return this.api.get<Order>(`/orders/${id}`);
    return this.api.get<Order>(`/orders/${id}`);
  }
}
