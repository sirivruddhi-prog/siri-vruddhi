import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { adminInquiriesPath } from '../admin-context';
import { AdminService, Inquiry, InquiryStatus } from '../admin.service';

@Component({
  selector: 'app-inquiry-detail',
  templateUrl: './inquiry-detail.component.html',
  styleUrls: ['./inquiry-detail.component.css'],
})
export class InquiryDetailComponent implements OnInit {
  inquiry: Inquiry | null = null;
  loading = true;
  saving = false;
  error = '';
  saveMessage = '';
  selectedStatus: InquiryStatus = 'new';
  adminNotes = '';

  readonly statuses: { value: InquiryStatus; label: string }[] = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'visit_scheduled', label: 'Visit scheduled' },
    { value: 'booked', label: 'Booked' },
    { value: 'closed', label: 'Closed' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private admin: AdminService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(adminInquiriesPath());
      return;
    }

    this.admin.getInquiry(id).subscribe({
      next: (inquiry) => {
        this.inquiry = inquiry;
        this.selectedStatus = inquiry.status;
        this.adminNotes = inquiry.adminNotes || '';
        this.loading = false;
      },
      error: () => {
        this.error = 'Inquiry not found.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (!this.inquiry || this.saving) {
      return;
    }

    this.saving = true;
    this.error = '';
    this.saveMessage = '';

    this.admin.updateInquiry(this.inquiry.id, {
      status: this.selectedStatus,
      adminNotes: this.adminNotes,
    }).subscribe({
      next: (inquiry) => {
        this.inquiry = inquiry;
        this.saving = false;
        this.saveMessage = 'Saved.';
      },
      error: () => {
        this.error = 'Unable to save changes.';
        this.saving = false;
      },
    });
  }

  phoneHref(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    return `tel:${digits}`;
  }

  emailHref(email: string): string {
    return `mailto:${email}`;
  }

  whatsappHref(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    const normalized = digits.startsWith('91') ? digits : `91${digits}`;
    return `https://wa.me/${normalized}`;
  }

  formatDate(value: string | null): string {
    if (!value) {
      return '—';
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  goBack(): void {
    this.router.navigate(adminInquiriesPath());
  }
}
