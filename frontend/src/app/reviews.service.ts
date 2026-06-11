import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { resolveApiUrl } from './api-url';

export interface ReviewItem {
  authorName: string;
  authorPhotoUrl: string | null;
  authorProfileUrl: string | null;
  rating: number;
  text: string;
  relativeTime: string;
  source: 'google' | 'manual';
}

export interface ReviewsPayload {
  eyebrow: string;
  title: string;
  lead: string;
  rating: number | null;
  userRatingCount: number | null;
  writeReviewUrl: string | null;
  viewAllUrl: string | null;
  writeReviewLabel: string;
  viewAllLabel: string;
  source: 'google' | 'manual' | 'none';
  items: ReviewItem[];
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private cache$?: Observable<ReviewsPayload>;
  private readonly apiUrl = resolveApiUrl();

  constructor(private http: HttpClient) {}

  load(refresh = false): Observable<ReviewsPayload> {
    if (refresh) {
      this.cache$ = undefined;
    }
    if (!this.cache$) {
      this.cache$ = this.http.get<ReviewsPayload>(`${this.apiUrl}/reviews`).pipe(
        catchError(() => of(this.buildFallback())),
        shareReplay(1)
      );
    }
    return this.cache$;
  }

  private buildFallback(): ReviewsPayload {
    return {
      eyebrow: 'Guest Voices',
      title: 'What Families Say',
      lead: 'Heartfelt words from families who celebrated their cherished moments at Siri Vruddhi.',
      rating: null,
      userRatingCount: null,
      writeReviewUrl: null,
      viewAllUrl: 'https://maps.app.goo.gl/v7SxsyCN2xEzYUH59',
      writeReviewLabel: 'Rate us on Google',
      viewAllLabel: 'See all reviews on Google',
      source: 'none',
      items: [],
    };
  }
}
