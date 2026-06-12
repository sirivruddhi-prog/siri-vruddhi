import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ContactService, InquiryRequest } from '../contact.service';
import { ReviewsPayload, ReviewsService } from '../reviews.service';
import { PublicSiteContent, SiteContentService } from '../site-content.service';
import { SITE_CONTACT } from '../site-contact';
import { animateStatValue, AnimatedStat, buildAnimatedStats } from '../stat-counter.util';

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
  animatedStats: AnimatedStat[] = [];
  spaces: SpaceCard[] = [];
  introFeatures: { icon: string; title: string; desc: string; image: string }[] = [];
  facilities: { icon: string; title: string; desc: string }[] = [];
  reviews: ReviewsPayload | null = null;
  reviewAvatars: { name: string; photo: string | null }[] = [];

  activeSlide = 0;
  activeReviewSlide = 0;
  expandedReview = -1;
  expandedSpace = -1;
  activeTagline = '';
  taglineFading = false;
  teaserInView = false;
  teaserPlaying = false;
  formSuccess = false;
  formShake = false;
  heroTiltX = 0;
  heroTiltY = 0;
  diningParallax = 0;

  submitting = false;
  private slideTimer?: ReturnType<typeof setInterval>;
  private reviewTimer?: ReturnType<typeof setInterval>;
  private taglineTimer?: ReturnType<typeof setInterval>;
  private contentSub?: Subscription;
  private reviewsSub?: Subscription;
  private taglineIndex = 0;
  private taglinePool: string[] = [];
  private statsAnimated = false;

  inquiry: InquiryRequest = {
    name: '',
    email: '',
    phone: '',
    eventType: 'Wedding',
    message: ''
  };
  touched = {
    name: false,
    email: false,
    phone: false,
    eventType: false,
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
        this.reviewAvatars = reviews.items
          .filter((item) => item.authorPhotoUrl || item.authorName)
          .slice(0, 5)
          .map((item) => ({
            name: item.authorName,
            photo: item.authorPhotoUrl,
          }));
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
    if (this.slideTimer) clearInterval(this.slideTimer);
    if (this.reviewTimer) clearInterval(this.reviewTimer);
    if (this.taglineTimer) clearInterval(this.taglineTimer);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const dining = document.getElementById('dining');
    if (dining) {
      const rect = dining.getBoundingClientRect();
      const progress = 1 - Math.min(1, Math.max(0, (rect.top + rect.height * 0.5) / window.innerHeight));
      this.diningParallax = progress * 24;
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (window.innerWidth < 1024) return;
    const x = (event.clientX / window.innerWidth - 0.5) * 8;
    const y = (event.clientY / window.innerHeight - 0.5) * 6;
    this.heroTiltX = x;
    this.heroTiltY = y;
  }

  private applyContent(content: PublicSiteContent): void {
    this.content = content;
    this.contact = content.contact;
    this.heroSlides = content.hero.slides.map((slide) => ({
      src: (slide as { src?: string; file?: string }).src || this.siteContent.img(slide.file || ''),
      alt: slide.alt,
    }));
    this.animatedStats = buildAnimatedStats(content.stats.items);
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

    const hero = content.hero as { tagline: string; taglines?: string[] };
    this.taglinePool = (hero.taglines?.length ? hero.taglines : [hero.tagline]).filter(Boolean);
    this.taglineIndex = 0;
    this.activeTagline = this.taglinePool[0] || hero.tagline;
    this.startTaglineRotation();
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
    if (this.reviewTimer) {
      clearInterval(this.reviewTimer);
      this.reviewTimer = undefined;
    }
  }

  toggleSpace(index: number): void {
    this.expandedSpace = this.expandedSpace === index ? -1 : index;
  }

  touchField(field: keyof typeof this.touched): void {
    this.touched[field] = true;
  }

  isFieldValid(field: 'name' | 'email' | 'phone'): boolean {
    const value = this.inquiry[field]?.trim() || '';
    if (field === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }
    return value.length >= 2;
  }

  fieldClass(field: 'name' | 'email' | 'phone'): Record<string, boolean> {
    if (!this.touched[field]) return {};
    return {
      'is-valid': this.isFieldValid(field),
      'is-invalid': !this.isFieldValid(field),
    };
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
    this.touched = { name: true, email: true, phone: true, eventType: true };
    if (!this.isFieldValid('name') || !this.isFieldValid('email') || !this.isFieldValid('phone')) {
      this.formShake = true;
      setTimeout(() => (this.formShake = false), 500);
      return;
    }

    this.statusMessage = '';
    this.statusError = false;
    this.formSuccess = false;
    this.submitting = true;

    this.contactService.sendInquiry(this.inquiry).subscribe({
      next: (response) => {
        this.statusMessage = response.message;
        this.submitting = false;
        this.formSuccess = true;
        this.inquiry = {
          name: '',
          email: '',
          phone: '',
          eventType: 'Wedding',
          message: ''
        };
        this.touched = { name: false, email: false, phone: false, eventType: false };
      },
      error: (error) => {
        this.statusError = true;
        this.submitting = false;
        this.formShake = true;
        setTimeout(() => (this.formShake = false), 500);
        this.statusMessage =
          error?.error?.error || 'Failed to send inquiry. Please try again later.';
      }
    });
  }

  private startReviewTimer(): void {
    if (this.reviewTimer) clearInterval(this.reviewTimer);
    if (!this.reviews?.items.length) return;
    this.reviewTimer = setInterval(() => {
      this.activeReviewSlide = (this.activeReviewSlide + 1) % this.reviews!.items.length;
    }, 7000);
  }

  private startTaglineRotation(): void {
    if (this.taglineTimer) clearInterval(this.taglineTimer);
    if (this.taglinePool.length <= 1) return;

    this.taglineTimer = setInterval(() => {
      this.taglineFading = true;
      setTimeout(() => {
        this.taglineIndex = (this.taglineIndex + 1) % this.taglinePool.length;
        this.activeTagline = this.taglinePool[this.taglineIndex];
        this.taglineFading = false;
      }, 400);
    }, 8000);
  }

  private scheduleRevealObserver(): void {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.initRevealObserver());
    });
  }

  private initRevealObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);

            if (entry.target.id === 'stats' && !this.statsAnimated) {
              this.statsAnimated = true;
              this.runStatCounters();
            }
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    const teaser = document.getElementById('teaser');
    if (teaser) {
      const teaserObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.teaserInView = true;
              teaserObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.35 }
      );
      teaserObserver.observe(teaser);
    }
  }

  private runStatCounters(): void {
    this.animatedStats.forEach((stat, index) => {
      animateStatValue(stat.raw, 1200, (value) => {
        this.animatedStats[index] = { ...stat, display: value };
      });
    });
  }
}
