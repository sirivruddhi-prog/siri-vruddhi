import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { adminInquiriesPath, adminWebsitePath } from '../admin-context';
import { AdminService, DashboardResponse } from '../admin.service';

interface ActionTile {
  icon: string;
  title: string;
  desc: string;
  action: () => void;
  accent: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['../admin-theme.css', '../admin-shared.css', './dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  data: DashboardResponse | null = null;
  loading = true;
  error = '';
  greeting = '';
  actionTiles: ActionTile[] = [];

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit(): void {
    const hour = new Date().getHours();
    if (hour < 12) this.greeting = 'Good morning';
    else if (hour < 17) this.greeting = 'Good afternoon';
    else this.greeting = 'Good evening';

    this.actionTiles = [
      {
        icon: '✉',
        title: 'Review inquiries',
        desc: 'Respond to new leads and update follow-up status.',
        action: () => this.goInquiries(),
        accent: 'tile--bronze',
      },
      {
        icon: '☎',
        title: 'Contact settings',
        desc: 'Phone, email, WhatsApp, maps and social links.',
        action: () => this.goWebsite('contact'),
        accent: 'tile--blue',
      },
      {
        icon: '⌂',
        title: 'Edit home page',
        desc: 'Hero, about, spaces, dining and venue copy.',
        action: () => this.goWebsite('home'),
        accent: 'tile--green',
      },
      {
        icon: '▣',
        title: 'Manage gallery',
        desc: 'Upload photos and control what visitors see.',
        action: () => this.goWebsite('gallery'),
        accent: 'tile--gold',
      },
    ];

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

  sectionLabel(key: string): string {
    const labels: Record<string, string> = {
      contact: 'Contact & links',
      hero: 'Hero banner',
      stats: 'Stats bar',
      teaser: 'Video teaser',
      intro: 'Intro section',
      about: 'About section',
      spaces: 'Spaces grid',
      facilities: 'Facilities',
      reviews: 'Google reviews',
      dining: 'Dining banner',
      contactPanel: 'Contact form',
      gallery: 'Gallery',
    };
    return labels[key] || key;
  }

  eventTypeEntries(record: Record<string, number>): { key: string; value: number }[] {
    return Object.entries(record || {})
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => b.value - a.value);
  }

  barWidth(value: number, max: number): string {
    if (!max) return '0%';
    return `${Math.round((value / max) * 100)}%`;
  }
}
