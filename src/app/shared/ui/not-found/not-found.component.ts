import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="nf">
      <h1>404 - Not Found</h1>
      <p>The page you requested does not exist.</p>
      <a routerLink="/" class="nf__home">Go Home</a>
    </section>
  `,
  styles: [`.nf{padding:3rem;text-align:center}.nf__home{color:var(--color-primary,#1976d2)}`]
})
export class NotFoundComponent {}
