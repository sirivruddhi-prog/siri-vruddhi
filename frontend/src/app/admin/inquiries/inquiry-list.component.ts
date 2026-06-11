import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService, Inquiry, InquiryStatus } from '../admin.service';

@Component({
  selector: 'app-inquiry-list',
  templateUrl: './inquiry-list.component.html',
  styleUrls: ['./inquiry-list.component.css'],
})
export class InquiryListComponent implements OnInit {
  inquiries: Inquiry[] = [];
  loading = true;
  error = '';
  search = '';
  statusFilter: InquiryStatus | '' = '';
  eventTypeFilter = '';
  counts = { new: 0, thisWeek: 0 };
  total = 0;
  exporting = false;

  readonly statuses: { value: InquiryStatus | ''; label: string }[] = [
    { value: '', label: 'All statuses' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'visit_scheduled', label: 'Visit scheduled' },
    { value: 'booked', label: 'Booked' },
    { value: 'closed', label: 'Closed' },
  ];

  readonly eventTypes = [
    'Wedding',
    'Engagement',
    'Upanayanam',
    'Naming Ceremony',
    'Baby Shower',
    'Birthday',
    'Other Celebration',
  ];

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.loadInquiries();
  }

  loadInquiries(): void {
    this.loading = true;
    this.error = '';

    this.admin.listInquiries({
      status: this.statusFilter,
      eventType: this.eventTypeFilter || undefined,
      search: this.search.trim() || undefined,
    }).subscribe({
      next: (response) => {
        this.inquiries = response.inquiries;
        this.total = response.total;
        this.counts = response.counts;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load inquiries.';
        this.loading = false;
      },
    });
  }

  applyFilters(): void {
    this.loadInquiries();
  }

  openInquiry(id: number): void {
    this.router.navigate(['/admin/inquiries', id]);
  }

  exportCsv(): void {
    if (this.exporting) {
      return;
    }
    this.exporting = true;

    this.admin.exportCsv({
      status: this.statusFilter,
      eventType: this.eventTypeFilter || undefined,
      search: this.search.trim() || undefined,
    }).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => {
        this.error = 'Unable to export CSV.';
        this.exporting = false;
      },
    });
  }

  formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  statusLabel(status: InquiryStatus): string {
    const match = this.statuses.find((item) => item.value === status);
    return match?.label || status;
  }
}
