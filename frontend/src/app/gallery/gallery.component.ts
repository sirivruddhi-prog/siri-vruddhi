import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Subscription } from 'rxjs';
import { PublicSiteContent, SiteContentService } from '../site-content.service';
import { GalleryItem } from '../venue-images';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.css'],
  animations: [
    trigger('galleryGrid', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'scale(0.96) translateY(12px)' }),
          stagger(35, [
            animate('320ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'scale(1) translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
  ],
})
export class GalleryComponent implements OnInit, OnDestroy {
  contentLoading = true;
  content: PublicSiteContent | null = null;
  pageHeroImage = '';
  categories = ['All'];
  activeCategory = 'All';
  galleryKey = 0;
  filteredItems: GalleryItem[] = [];
  lightboxOpen = false;
  lightboxIndex = 0;
  private contentSub?: Subscription;

  constructor(private siteContent: SiteContentService) {}

  ngOnInit(): void {
    this.contentSub = this.siteContent.watch().subscribe({
      next: (content) => {
        const firstLoad = this.contentLoading;
        this.content = content;
        this.pageHeroImage = content.gallery.pageHeroSrc || this.siteContent.img(content.gallery.pageHeroFile || '');
        this.categories = ['All', ...content.gallery.categories];
        this.filterCategory('All');
        this.contentLoading = false;
        if (firstLoad) {
          this.scheduleRevealObserver();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
  }

  filterCategory(category: string): void {
    this.activeCategory = category;
    const items = (this.content?.gallery.items || []).map((item) => ({
      src: item.src || this.siteContent.img(item.file || ''),
      alt: item.alt,
      title: item.title,
      category: item.category,
    }));
    this.filteredItems =
      category === 'All' ? items : items.filter((item) => item.category === category);
    this.galleryKey += 1;
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

  private scheduleRevealObserver(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.initRevealObserver());
    });
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
      { threshold: 0, rootMargin: '0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }
}
