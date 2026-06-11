import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { adminInquiriesPath, adminWebsitePath } from '../admin-context';
import { AdminService, DashboardResponse } from '../admin.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css', '../admin-shared.css'],
})
export class DashboardComponent implements OnInit {
  data: DashboardResponse | null = null;
  loading = true;
  error = '';

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.admin.getDashboard().subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load dashboard.';
        this.loading = false;
      },
    });
  }

  goInquiries(): void {
    this.router.navigate(adminInquiriesPath());
  }

  goWebsite(section: string): void {
    this.router.navigate(adminWebsitePath(section));
  }

  formatDate(value: string | null | undefined): string {
    if (!value) return 'Not saved yet';
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
}
