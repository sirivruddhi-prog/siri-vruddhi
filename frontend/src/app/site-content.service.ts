import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, of, timer } from 'rxjs';
import { catchError, filter, finalize, retry, switchMap, take, tap } from 'rxjs/operators';
import { resolveApiUrl } from './api-url';
import { buildSiteContentFallback } from './site-content-fallback';
import { SITE_CONTACT } from './site-contact';
import { venueImg } from './venue-images';

export interface PublicSiteContent {
  contact: typeof SITE_CONTACT;
  hero: {
    eyebrow: string;
    welcome: string;
    tagline: string;
    taglines?: string[];
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
  reviews?: {
    eyebrow: string;
    title: string;
    lead: string;
    writeReviewUrl?: string | null;
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
  private readonly contentSubject = new BehaviorSubject<PublicSiteContent | null>(null);
  private readonly loadingSubject = new BehaviorSubject(false);
  private fetchStarted = false;
  private apiLoaded = false;
  private backgroundRefreshStarted = false;

  readonly loading$ = this.loadingSubject.asObservable();

  private readonly apiUrl = resolveApiUrl();

  constructor(private http: HttpClient) {}

  /** First emission only — use `watch()` when the page should react to later CMS updates. */
  load(refresh = false): Observable<PublicSiteContent> {
    return this.watch(refresh).pipe(take(1));
  }

  /** Emits whenever site content is available or refreshed from the API. */
  watch(refresh = false): Observable<PublicSiteContent> {
    this.startFetch(refresh);
    return this.contentSubject.pipe(
      filter((content): content is PublicSiteContent => content !== null)
    );
  }

  img(file: string): string {
    return venueImg(file);
  }

  private startFetch(refresh: boolean): void {
    if (refresh) {
      this.fetchStarted = false;
      this.apiLoaded = false;
      this.backgroundRefreshStarted = false;
    }
    if (this.fetchStarted) {
      return;
    }
    this.fetchStarted = true;
    this.loadingSubject.next(true);

    this.http
      .get<PublicSiteContent>(`${this.apiUrl}/site`)
      .pipe(
        retry({ count: 4, delay: (_error, attempt) => timer(Math.min(1500 * attempt, 6000)) }),
        tap(() => {
          this.apiLoaded = true;
        }),
        catchError(() => of(buildSiteContentFallback())),
        finalize(() => this.loadingSubject.next(false))
      )
      .subscribe((content) => {
        this.contentSubject.next(content);
        if (!this.apiLoaded) {
          this.scheduleBackgroundRefresh();
        }
      });
  }

  private scheduleBackgroundRefresh(): void {
    if (this.backgroundRefreshStarted) {
      return;
    }
    this.backgroundRefreshStarted = true;

    timer(5000)
      .pipe(
        switchMap(() =>
          this.http.get<PublicSiteContent>(`${this.apiUrl}/site`).pipe(
            retry({ count: 5, delay: 5000 }),
            catchError(() => EMPTY)
          )
        )
      )
      .subscribe((content) => {
        this.apiLoaded = true;
        this.contentSubject.next(content);
      });
  }
}
