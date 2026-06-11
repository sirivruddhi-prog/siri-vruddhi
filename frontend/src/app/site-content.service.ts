import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { SITE_CONTACT } from './site-contact';
import { GALLERY_ITEMS, HERO_SLIDES, venueImg } from './venue-images';

export interface PublicSiteContent {
  contact: typeof SITE_CONTACT;
  hero: {
    eyebrow: string;
    welcome: string;
    tagline: string;
    slides: { file?: string; alt: string; src?: string; url?: string; mediaId?: number }[];
  };
  stats: { items: { value: string; label: string }[] };
  teaser: { eyebrow: string; title: string; lead: string };
  intro: {
    eyebrow: string;
    title: string;
    lead: string;
    features: { icon: string; title: string; desc: string; imageFile?: string; src?: string }[];
  };
  about: {
    eyebrow: string;
    title: string;
    paragraphs: string[];
    badge: string;
    imageFile?: string;
    src?: string;
  };
  spaces: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { icon: string; title: string; imageFile?: string; desc: string; detail: string; src?: string }[];
  };
  facilities: {
    eyebrow: string;
    title: string;
    lead: string;
    items: { icon: string; title: string; desc: string }[];
  };
  dining: {
    eyebrow: string;
    title: string;
    description: string;
    tags: string[];
    imageFile?: string;
    src?: string;
  };
  contactPanel: { eyebrow: string; title: string; lead: string };
  gallery: {
    pageHeroFile?: string;
    pageHeroSrc?: string;
    pageHeroAlt: string;
    pageTitle: string;
    pageLead: string;
    ctaTitle: string;
    ctaLead: string;
    categories: string[];
    items: { file?: string; category: string; title: string; alt: string; src?: string }[];
  };
  updatedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class SiteContentService {
  private cache$?: Observable<PublicSiteContent>;

  constructor(private http: HttpClient) {}

  load(refresh = false): Observable<PublicSiteContent> {
    if (refresh) {
      this.cache$ = undefined;
    }
    if (!this.cache$) {
      this.cache$ = this.http.get<PublicSiteContent>(`${environment.apiUrl}/site`).pipe(
        catchError(() => of(this.buildFallback())),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  img(file: string): string {
    return venueImg(file);
  }

  private buildFallback(): PublicSiteContent {
    return {
      contact: { ...SITE_CONTACT },
      hero: {
        eyebrow: 'Nelamangala · Near Budhihal',
        welcome: 'Welcome to',
        tagline:
          'A sacred, elegant destination where weddings, engagements, upanayanam, naming ceremonies, and treasured celebrations come alive in timeless beauty.',
        slides: HERO_SLIDES.map((slide) => ({
          file: decodeURIComponent(slide.src.replace('assets/images/', '')),
          alt: slide.alt,
        })),
      },
      stats: {
        items: [
          { value: '300-500', label: 'Floating Crowd' },
          { value: '200+', label: 'Seated Capacity' },
          { value: '60+', label: 'Dining Seats' },
          { value: '2', label: 'Mantapa Spaces' },
        ],
      },
      teaser: {
        eyebrow: 'Experience the Venue',
        title: 'A Glimpse of Siri Vruddhi',
        lead: 'Watch our venue come alive — timeless spaces designed for your most cherished celebrations.',
      },
      intro: {
        eyebrow: 'The Experience',
        title: 'Why Siri Vruddhi',
        lead: 'Beautiful indoor halls and serene outdoor gardens — tradition and modern comfort woven together for gatherings that feel truly extraordinary.',
        features: [],
      },
      about: {
        eyebrow: 'Our Story',
        title: 'About Siri Vruddhi',
        paragraphs: [
          'Step into a sacred destination where cherished celebrations come to life.',
          'Blending timeless tradition with modern comfort, our indoor and outdoor spaces are thoughtfully designed for every occasion.',
        ],
        badge: 'Est. for cherished celebrations',
        imageFile: 'Siri Vruddhi Exterior View.JPG',
      },
      spaces: { eyebrow: 'Venue Highlights', title: 'Spaces & Celebrations', lead: '', items: [] },
      facilities: { eyebrow: 'Venue Comforts', title: 'Premium Facilities & Comfort', lead: '', items: [] },
      dining: {
        eyebrow: 'Dining & Comfort',
        title: 'Where Every Meal Becomes a Memory',
        description: '',
        tags: [],
        imageFile: 'Indoor Dining Hall.JPG',
      },
      contactPanel: {
        eyebrow: 'Enquire',
        title: 'Plan Your Celebration',
        lead: "Send your event details — we'll reply with availability and next steps.",
      },
      gallery: {
        pageHeroFile: 'Siri Vruddhi Exterior View.JPG',
        pageHeroAlt: 'Siri Vruddhi exterior view',
        pageTitle: 'Gallery',
        pageLead: 'Step inside Siri Vruddhi — ceremonies, gardens, dining, and celebrations captured in every frame.',
        ctaTitle: 'Ready to see it in person?',
        ctaLead: 'Book a private tour and envision your celebration at our venue.',
        categories: ['Celebrations', 'Exterior', 'Foyer', 'Mantapa & Lawn', 'Indoor Halls', 'Dining', 'Amenities'],
        items: GALLERY_ITEMS.map((item) => ({
          file: decodeURIComponent(item.src.replace('assets/images/', '')),
          category: item.category,
          title: item.title,
          alt: item.alt,
        })),
      },
    };
  }
}
