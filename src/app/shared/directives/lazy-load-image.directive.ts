import { Directive, ElementRef, Input, OnInit, inject } from '@angular/core';

/**
 * Lazy load images using Intersection Observer API.
 * Usage: <img appLazyLoad [appLazyLoadPlaceholder]="placeholderUrl" [src]="imageUrl" />
 */
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoadPlaceholder: string = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E';
  @Input() appLazyLoadThreshold: number = 0.1;

  private el = inject(ElementRef);
  private realSrc: string | null = null;

  ngOnInit(): void {
    this.realSrc = this.el.nativeElement.src;

    // Set placeholder
    if (this.appLazyLoadPlaceholder) {
      this.el.nativeElement.src = this.appLazyLoadPlaceholder;
    }

    // Set up Intersection Observer
    const options: IntersectionObserverInit = {
      threshold: this.appLazyLoadThreshold
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && this.realSrc) {
          this.loadImage();
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, options);

    observer.observe(this.el.nativeElement);
  }

  private loadImage(): void {
    if (!this.realSrc) return;

    const img = new Image();
    img.onload = () => {
      this.el.nativeElement.src = this.realSrc;
      this.el.nativeElement.classList.add('lazy-loaded');
    };
    img.onerror = () => {
      console.warn(`[LazyLoad] Failed to load image: ${this.realSrc}`);
    };
    img.src = this.realSrc;
  }
}
