import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrdersService, Order } from '../../data-access/orders.service';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-orders-list-page',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './orders-list.page.html',
  styleUrl: './orders-list.page.scss'
})
export class OrdersListPage {
  private ordersService = inject(OrdersService);
  // For now static placeholder; in real app you'd subscribe to observable.
  orders: Order[] = [
    { id: '1', number: 'A-100', total: 120.5 },
    { id: '2', number: 'A-101', total: 89.99 }
  ];
}
