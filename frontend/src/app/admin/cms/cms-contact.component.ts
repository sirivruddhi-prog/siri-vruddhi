import { Component, OnInit } from '@angular/core';
import { AdminService } from '../admin.service';

interface ContactContent {
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  instagramUrl: string;
  mapsUrl: string;
  location: string;
  whatsappMessage: string;
}

@Component({
  selector: 'app-cms-contact',
  templateUrl: './cms-contact.component.html',
  styleUrls: ['../admin-theme.css', '../admin-shared.css'],
})
export class CmsContactComponent implements OnInit {
  content: ContactContent = {
    phoneDisplay: '',
    phoneTel: '',
    email: '',
    instagramUrl: '',
    mapsUrl: '',
    location: '',
    whatsappMessage: '',
  };
  loading = true;
  saving = false;
  message = '';
  error = '';

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getSiteSection<ContactContent>('contact').subscribe({
      next: (res) => {
        this.content = res.content;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load contact settings.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.message = '';
    this.error = '';
    this.admin.saveSiteSection('contact', this.content).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Contact settings saved. Changes appear on the live site within a minute.';
      },
      error: () => {
        this.saving = false;
        this.error = 'Unable to save contact settings.';
      },
    });
  }
}
