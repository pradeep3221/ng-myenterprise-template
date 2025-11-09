import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdersService, Order } from '../../data-access/orders.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-order-detail-page',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './order-detail.page.html'
})
export class OrderDetailPage {
  private route = inject(ActivatedRoute);
  private orders = inject(OrdersService);
  order?: Order;

  constructor() {
    const id = this.route.snapshot.paramMap.get('id')!;
    // Placeholder: simulate order fetch
    this.order = { id, number: 'A-100', total: 120.5 };
    // Real: this.orders.byId(id).subscribe(o => this.order = o);
  }
}
