import { Component, HostListener, OnInit } from '@angular/core';
import {
  GALLERY_CATEGORIES,
  GALLERY_ITEMS,
  GALLERY_PAGE_HERO_IMAGE,
  GalleryItem
} from '../gallery.data';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css']
})
export class GalleryComponent implements OnInit {
  pageHeroImage = GALLERY_PAGE_HERO_IMAGE;
  categories = GALLERY_CATEGORIES;
  activeCategory = 'All';
  filteredItems: GalleryItem[] = GALLERY_ITEMS;
  lightboxOpen = false;
  lightboxIndex = 0;

  ngOnInit(): void {
    this.initRevealObserver();
  }

  filterCategory(category: string): void {
    this.activeCategory = category;
    this.filteredItems =
      category === 'All'
        ? GALLERY_ITEMS
        : GALLERY_ITEMS.filter((item) => item.category === category);
  }

  openLightbox(index: number): void {
    this.lightboxIndex = index;
    this.lightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    document.body.style.overflow = '';
  }

  nextImage(): void {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.filteredItems.length;
  }

  prevImage(): void {
    this.lightboxIndex =
      (this.lightboxIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen) return;
    if (event.key === 'Escape') this.closeLightbox();
    if (event.key === 'ArrowRight') this.nextImage();
    if (event.key === 'ArrowLeft') this.prevImage();
  }

  private initRevealObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    }, 80);
  }
}
