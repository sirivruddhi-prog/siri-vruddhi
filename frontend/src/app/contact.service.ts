import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { resolveApiUrl } from './api-url';
import { Observable } from 'rxjs';

export interface InquiryRequest {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  message?: string;
}

export interface InquiryResponse {
  id: number;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
  private readonly apiUrl = resolveApiUrl();

  constructor(private http: HttpClient) {}

  sendInquiry(payload: InquiryRequest): Observable<InquiryResponse> {
    return this.http.post<InquiryResponse>(`${this.apiUrl}/inquiries`, payload);
  }
}
