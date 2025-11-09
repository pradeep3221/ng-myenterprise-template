import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgIf],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'text' = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() clicked = new EventEmitter<Event>();

  onClick(event: Event) {
    if (!this.disabled && !this.loading) this.clicked.emit(event);
  }
}
