import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { resolveApiUrl } from '../api-url';

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

export interface DashboardResponse {
  inquiries: {
    new: number;
    today: number;
    thisWeek: number;
    total: number;
    duplicateCount: number;
    byEventType: Record<string, number>;
  };
  content: {
    updatedAt: string | null;
    sections: Record<string, string>;
  };
  sections: string[];
}

export interface SiteSectionResponse<T = unknown> {
  content: T;
  updatedAt: string;
}

export interface MediaUploadResponse {
  id: number;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

@Injectable()
export class AdminService {
  private readonly baseUrl = `${resolveApiUrl()}/admin`;
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

  getDashboard(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard`, this.httpOptions);
  }

  getSiteSection<T>(section: string): Observable<SiteSectionResponse<T>> {
    return this.http.get<SiteSectionResponse<T>>(`${this.baseUrl}/site/${section}`, this.httpOptions);
  }

  saveSiteSection<T>(section: string, content: T): Observable<SiteSectionResponse<T>> {
    return this.http.put<SiteSectionResponse<T>>(`${this.baseUrl}/site/${section}`, content, this.httpOptions);
  }

  uploadMedia(file: File): Observable<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<MediaUploadResponse>(`${this.baseUrl}/media/upload`, formData, this.httpOptions);
  }
}
