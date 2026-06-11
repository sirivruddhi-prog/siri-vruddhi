import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactService, InquiryRequest } from '../contact.service';
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
  content: PublicSiteContent | null = null;
  contact = SITE_CONTACT;
  heroSlides: { src: string; alt: string }[] = [];
  aboutImage = '';
  diningBannerImage = '';
  stats: { value: string; label: string }[] = [];
  spaces: SpaceCard[] = [];
  introFeatures: { icon: string; title: string; desc: string; image: string }[] = [];
  facilities: { icon: string; title: string; desc: string }[] = [];

  activeSlide = 0;
  submitting = false;
  teaserPlaying = false;
  private slideTimer?: ReturnType<typeof setInterval>;

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
    private siteContent: SiteContentService
  ) {}

  ngOnInit(): void {
    this.siteContent.load().subscribe((content) => {
      this.applyContent(content);
    });
    this.slideTimer = setInterval(() => this.nextSlide(), 6000);
    this.initRevealObserver();
  }

  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
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

    setTimeout(() => {
      document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    }, 100);
  }
}
