import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactService, InquiryRequest } from '../contact.service';
import {
  ABOUT_IMAGE,
  DINING_BANNER_IMAGE,
  HERO_SLIDES,
  venueImg
} from '../venue-images';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  heroSlides = HERO_SLIDES;
  aboutImage = ABOUT_IMAGE;
  diningBannerImage = DINING_BANNER_IMAGE;

  stats = [
    { value: '200+', label: 'Guest Capacity' },
    { value: '2', label: 'Mantapa Spaces' },
    { value: '60+', label: 'Dining Seats' },
    { value: '1', label: 'Venue, Endless Memories' }
  ];

  spaces = [
    {
      icon: '🪷',
      title: 'Mantapa Spaces',
      image: venueImg('Mantapa 2 with Lawn and 2 Kattes.JPG'),
      desc: 'Two beautifully designed mantapas blending elegance and versatility for every ritual.',
      detail: 'Mehendi, Haldi, Homas, Gowri Puja — or styled as beverage counters.'
    },
    {
      icon: '✨',
      title: 'Grand Foyer',
      image: venueImg('Foyer & Seating Area.JPG'),
      desc: 'An impressive entrance that welcomes 200+ guests with timeless grandeur.',
      detail: 'Water fountain, Radha Krishna mural, and stunning hall views.'
    },
    {
      icon: '🌿',
      title: 'Outdoor Charm',
      image: venueImg('Lawn and Mantapa area.JPG'),
      desc: 'Serene gardens and traditional seating beneath picturesque trees.',
      detail: 'Lush greenery for peaceful ceremonies and natural photo moments.'
    }
  ];

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

  constructor(private contactService: ContactService) {}

  ngOnInit(): void {
    this.slideTimer = setInterval(() => this.nextSlide(), 6000);
    this.initRevealObserver();
  }

  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  nextSlide(): void {
    this.activeSlide = (this.activeSlide + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.activeSlide =
      (this.activeSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
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
