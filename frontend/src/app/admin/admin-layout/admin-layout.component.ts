import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { adminLoginPath } from '../admin-context';
import { AdminService } from '../admin.service';

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  inquiries: 'Inquiries',
  contact: 'Contact & Links',
  home: 'Home Page',
  gallery: 'Gallery Manager',
};

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['../admin-theme.css', './admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  email = 'sirivruddhi@gmail.com';
  loggingOut = false;
  pageTitle = 'Dashboard';
  private routerSub?: Subscription;

  constructor(private admin: AdminService, private router: Router) {}

  ngOnInit(): void {
    this.admin.getSession().subscribe({
      next: (session) => {
        this.email = session.email;
      },
      error: () => {
        this.router.navigate(adminLoginPath());
      },
    });

    this.updateTitle(this.router.url);
    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.updateTitle(nav.urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private updateTitle(url: string): void {
    if (url.includes('/inquiries/')) {
      this.pageTitle = 'Inquiry Details';
      return;
    }
    if (url.includes('/website/contact')) {
      this.pageTitle = PAGE_TITLES.contact;
      return;
    }
    if (url.includes('/website/home')) {
      this.pageTitle = PAGE_TITLES.home;
      return;
    }
    if (url.includes('/website/gallery')) {
      this.pageTitle = PAGE_TITLES.gallery;
      return;
    }
    if (url.includes('/inquiries')) {
      this.pageTitle = PAGE_TITLES.inquiries;
      return;
    }
    this.pageTitle = PAGE_TITLES.dashboard;
  }

  logout(): void {
    if (this.loggingOut) {
      return;
    }
    this.loggingOut = true;

    this.admin.logout().subscribe({
      complete: () => {
        this.loggingOut = false;
        this.router.navigate(adminLoginPath());
      },
      error: () => {
        this.loggingOut = false;
        this.router.navigate(adminLoginPath());
      },
    });
  }
}
