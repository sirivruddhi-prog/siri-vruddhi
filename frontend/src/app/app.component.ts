import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { isAdminApp } from './admin/admin-context';
import { SITE_CONTACT } from './site-contact';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Siri Vruddhi';
  contact = SITE_CONTACT;
  headerScrolled = false;
  menuOpen = false;
  showSiteChrome = true;
  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateChrome(this.router.url);
    this.updateHeaderScroll();

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.updateChrome(nav.urlAfterRedirects);
        this.closeMenu();
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (this.showSiteChrome) {
      this.updateHeaderScroll();
    }
  }

  private updateChrome(url: string): void {
    this.showSiteChrome = !isAdminApp(url);
    document.body.classList.toggle('admin-app', !this.showSiteChrome);
  }

  private updateHeaderScroll(): void {
    this.headerScrolled = window.scrollY > 48;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
