import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type InquiryStatus = 'new' | 'contacted' | 'visit_scheduled' | 'booked' | 'closed';

export interface AdminSession {
  ok: boolean;
  email: string;
}

export interface Inquiry {
  id: number;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  message: string;
  status: InquiryStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string | null;
  isDuplicate?: boolean;
}

export interface InquiryCounts {
  new: number;
  today: number;
  thisWeek: number;
  byStatus: Record<InquiryStatus, number>;
  byEventType: Record<string, number>;
}

export interface InquiryListResponse {
  inquiries: Inquiry[];
  total: number;
  page: number;
  limit: number;
  counts: InquiryCounts;
  duplicateCount: number;
}

export interface InquiryFilters {
  status?: InquiryStatus | '';
  eventType?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;
  private readonly httpOptions = { withCredentials: true };

  constructor(private http: HttpClient) {}

  login(password: string): Observable<AdminSession> {
    return this.http.post<AdminSession>(`${this.baseUrl}/login`, { password }, this.httpOptions);
  }

  logout(): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${this.baseUrl}/logout`, {}, this.httpOptions);
  }

  getSession(): Observable<AdminSession> {
    return this.http.get<AdminSession>(`${this.baseUrl}/me`, this.httpOptions);
  }

  listInquiries(filters: InquiryFilters = {}): Observable<InquiryListResponse> {
    let params = new HttpParams();
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.eventType) {
      params = params.set('eventType', filters.eventType);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    if (filters.page) {
      params = params.set('page', String(filters.page));
    }
    if (filters.limit) {
      params = params.set('limit', String(filters.limit));
    }
    return this.http.get<InquiryListResponse>(`${this.baseUrl}/inquiries`, { ...this.httpOptions, params });
  }

  getInquiry(id: number): Observable<Inquiry> {
    return this.http.get<Inquiry>(`${this.baseUrl}/inquiries/${id}`, this.httpOptions);
  }

  updateInquiry(id: number, payload: { status?: InquiryStatus; adminNotes?: string }): Observable<Inquiry> {
    return this.http.patch<Inquiry>(`${this.baseUrl}/inquiries/${id}`, payload, this.httpOptions);
  }

  exportCsv(filters: InquiryFilters = {}): Observable<Blob> {
    let params = new HttpParams();
    if (filters.status) {
      params = params.set('status', filters.status);
    }
    if (filters.eventType) {
      params = params.set('eventType', filters.eventType);
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }
    return this.http.get(`${this.baseUrl}/inquiries/export.csv`, {
      ...this.httpOptions,
      params,
      responseType: 'blob',
    });
  }
}
