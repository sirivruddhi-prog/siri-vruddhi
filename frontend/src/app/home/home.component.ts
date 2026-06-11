import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContactService, InquiryRequest } from '../contact.service';
import { ReviewsPayload, ReviewsService } from '../reviews.service';
import { PublicSiteContent, SiteContentService } from '../site-content.service';
import { SITE_CONTACT } from '../site-contact';

interface SpaceCard {
  icon: string;
  title: string;
  image: string;
  desc: string;
  detail: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  contentLoading = true;
  content: PublicSiteContent | null = null;
  contact = SITE_CONTACT;
  heroSlides: { src: string; alt: string }[] = [];
  aboutImage = '';
  diningBannerImage = '';
  stats: { value: string; label: string }[] = [];
  spaces: SpaceCard[] = [];
  introFeatures: { icon: string; title: string; desc: string; image: string }[] = [];
  facilities: { icon: string; title: string; desc: string }[] = [];
  reviews: ReviewsPayload | null = null;

  activeSlide = 0;
  activeReviewSlide = 0;
  expandedReview = -1;
  submitting = false;
  teaserPlaying = false;
  private slideTimer?: ReturnType<typeof setInterval>;
  private reviewTimer?: ReturnType<typeof setInterval>;
  private contentSub?: Subscription;
  private reviewsSub?: Subscription;

  inquiry: InquiryRequest = {
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    message: ''
  };
  statusMessage = '';
  statusError = false;

  constructor(
    private contactService: ContactService,
    private siteContent: SiteContentService,
    private reviewsService: ReviewsService
  ) {}

  ngOnInit(): void {
    this.contentSub = this.siteContent.watch().subscribe({
      next: (content) => {
        const firstLoad = this.contentLoading;
        this.applyContent(content);
        this.contentLoading = false;
        if (firstLoad) {
          this.scheduleRevealObserver();
        }
      },
    });
    this.slideTimer = setInterval(() => this.nextSlide(), 6000);
    this.reviewsSub = this.reviewsService.load().subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        if (reviews.items.length) {
          this.activeReviewSlide = 0;
          this.startReviewTimer();
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.contentSub?.unsubscribe();
    this.reviewsSub?.unsubscribe();
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
    if (this.reviewTimer) {
      clearInterval(this.reviewTimer);
    }
  }

  private applyContent(content: PublicSiteContent): void {
    this.content = content;
    this.contact = content.contact;
    this.heroSlides = content.hero.slides.map((slide) => ({
      src: (slide as { src?: string; file?: string }).src || this.siteContent.img(slide.file || ''),
      alt: slide.alt,
    }));
    this.stats = content.stats.items;
    this.aboutImage = content.about.src || this.siteContent.img(content.about.imageFile || '');
    this.diningBannerImage = content.dining.src || this.siteContent.img(content.dining.imageFile || '');
    this.introFeatures = content.intro.features.map((feature) => ({
      icon: feature.icon,
      title: feature.title,
      desc: feature.desc,
      image: feature.src || this.siteContent.img(feature.imageFile || ''),
    }));
    this.spaces = content.spaces.items.map((space) => ({
      icon: space.icon,
      title: space.title,
      image: space.src || this.siteContent.img(space.imageFile || ''),
      desc: space.desc,
      detail: space.detail,
    }));
    this.facilities = content.facilities.items;
    if (this.activeSlide >= this.heroSlides.length) {
      this.activeSlide = 0;
    }
  }

  nextSlide(): void {
    if (!this.heroSlides.length) return;
    this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    if (!this.heroSlides.length) return;
    this.activeSlide = (this.activeSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  goToSlide(index: number): void {
    this.activeSlide = index;
  }

  nextReview(): void {
    if (!this.reviews?.items.length) return;
    this.activeReviewSlide = (this.activeReviewSlide + 1) % this.reviews.items.length;
    this.expandedReview = -1;
    this.startReviewTimer();
  }

  prevReview(): void {
    if (!this.reviews?.items.length) return;
    this.activeReviewSlide =
      (this.activeReviewSlide - 1 + this.reviews.items.length) % this.reviews.items.length;
    this.expandedReview = -1;
    this.startReviewTimer();
  }

  goToReview(index: number): void {
    this.activeReviewSlide = index;
    this.expandedReview = -1;
    this.startReviewTimer();
  }

  isStarFilled(reviewIndex: number, starIndex: number): boolean {
    const rating = this.reviews?.items[reviewIndex]?.rating || 0;
    return starIndex < Math.round(rating);
  }

  isLongReview(text: string): boolean {
    return (text || '').length > 220;
  }

  isReviewExpanded(index: number): boolean {
    return this.expandedReview === index;
  }

  toggleReviewExpand(index: number): void {
    if (this.expandedReview === index) {
      this.expandedReview = -1;
      this.startReviewTimer();
      return;
    }
    this.expandedReview = index;
    // Pause auto-rotation while the visitor reads the full review.
    if (this.reviewTimer) {
      clearInterval(this.reviewTimer);
      this.reviewTimer = undefined;
    }
  }

  private startReviewTimer(): void {
    if (this.reviewTimer) {
      clearInterval(this.reviewTimer);
    }
    if (!this.reviews?.items.length) return;
    this.reviewTimer = setInterval(() => {
      this.activeReviewSlide = (this.activeReviewSlide + 1) % this.reviews!.items.length;
    }, 7000);
  }

  playTeaser(event: Event): void {
    const overlay = (event.currentTarget as HTMLElement);
    const frame = overlay.closest('.teaser-video-frame');
    const video = frame?.querySelector('video');
    if (video) {
      this.teaserPlaying = true;
      video.play();
    }
  }

  submitInquiry(): void {
    if (this.submitting) return;
    this.statusMessage = '';
    this.statusError = false;
    this.submitting = true;

    this.contactService.sendInquiry(this.inquiry).subscribe({
      next: (response) => {
        this.statusMessage = response.message;
        this.submitting = false;
        this.inquiry = {
          name: '',
          email: '',
          phone: '',
          eventType: 'Wedding',
          message: ''
        };
      },
      error: (error) => {
        this.statusError = true;
        this.submitting = false;
        this.statusMessage =
          error?.error?.error || 'Failed to send inquiry. Please try again later.';
      }
    });
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
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }
}
