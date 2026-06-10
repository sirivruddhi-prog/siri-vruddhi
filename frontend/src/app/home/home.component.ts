import { Component, OnDestroy, OnInit } from '@angular/core';
import { ContactService, InquiryRequest } from '../contact.service';
import { SITE_CONTACT } from '../site-contact';
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
  contact = SITE_CONTACT;
  heroSlides = HERO_SLIDES;
  aboutImage = ABOUT_IMAGE;
  diningBannerImage = DINING_BANNER_IMAGE;

  stats = [
    { value: '300-500', label: 'Floating Crowd' },
    { value: '200+', label: 'Seated Capacity' },
    { value: '60+', label: 'Dining Seats' },
    { value: '2', label: 'Mantapa Spaces' }
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
      title: 'Lawn & Outdoor Dining',
      image: venueImg('Lawn Area for Outdoor Canopy Set up.JPG'),
      desc: 'An expansive, lush green lawn area that can be converted into an enchanting open-air dining space.',
      detail: 'Perfect for a 300-500 floating crowd, hosting banquet setups, canopies, and grand feasts.'
    },
    {
      icon: '🌳',
      title: 'Shaded Tree Kattes',
      image: venueImg('Terminalia Katte.JPG'),
      desc: 'Traditional stone-carved platforms (Kattes) built around towering trees like the Terminalia.',
      detail: 'Breezy green shade, ideal for peaceful outdoor seating and serene photo moments.'
    },
    {
      icon: '🏡',
      title: 'Eco-Friendly Lodging',
      image: venueImg('Room.JPG'),
      desc: 'Premium guest rooms providing complete comfort and luxury accommodation for your family.',
      detail: 'Equipped with comfortable double cots, cupboards, modern restrooms, and powered by solar energy.'
    },
    {
      icon: '📸',
      title: 'Photo Backdrop',
      image: venueImg('Photo Wall Radha Krishna.JPG'),
      desc: 'A gorgeous Radha Krishna mural that acts as an exquisite, custom photo wall for your celebrations.',
      detail: 'Stunning artistic focal point in the foyer, ideal for capturing beautiful family memories.'
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
