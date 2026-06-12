import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { routeFadeAnimation } from './animations/route.animations';
import { isAdminApp } from './admin/admin-context';
import { SITE_CONTACT } from './site-contact';
import { SiteContentService } from './site-content.service';
import {
  getActiveSection,
  getScrollProgress,
  HOME_SECTION_IDS,
  scrollToSection,
} from './scroll.util';

interface NavSection {
  id: string;
  label: string;
  route?: string;
  fragment?: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [routeFadeAnimation],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Siri Vruddhi';
  contact = SITE_CONTACT;
  headerScrolled = false;
  menuOpen = false;
  showSiteChrome = true;
  isHomePage = true;
  activeSection = '';
  scrollProgress = 0;
  showBackToTop = false;
  showStickyCta = false;
  whatsappPulsing = true;

  readonly journeySections: NavSection[] = [
    { id: 'stats', label: 'Highlights' },
    { id: 'teaser', label: 'Video' },
    { id: 'about', label: 'About' },
    { id: 'spaces', label: 'Spaces' },
    { id: 'facilities', label: 'Facilities' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'dining', label: 'Dining' },
    { id: 'contact', label: 'Contact' },
  ];

  private routerSub?: Subscription;
  private contactInView = false;

  constructor(private router: Router, private siteContent: SiteContentService) {}

  ngOnInit(): void {
    this.siteContent.load().subscribe((content) => {
      this.contact = content.contact;
    });
    this.updateChrome(this.router.url);
    this.onScroll();

    this.routerSub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.updateChrome(nav.urlAfterRedirects);
        this.closeMenu();
        setTimeout(() => this.onScroll(), 100);
      });

    document.addEventListener('click', this.handleAnchorClick, true);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    document.removeEventListener('click', this.handleAnchorClick, true);
  }

  @HostListener('window:scroll')
  onScroll(): void {
    if (!this.showSiteChrome) return;

    this.headerScrolled = window.scrollY > 48;
    this.scrollProgress = getScrollProgress();
    this.showBackToTop = window.scrollY > 640;

    if (this.isHomePage) {
      this.activeSection = getActiveSection(HOME_SECTION_IDS);
      const contactEl = document.getElementById('contact');
      this.contactInView = contactEl
        ? contactEl.getBoundingClientRect().top < window.innerHeight * 0.85
        : false;
      this.showStickyCta = window.innerWidth <= 768 && window.scrollY > 520 && !this.contactInView;
    } else {
      this.activeSection = 'gallery';
      this.showStickyCta = false;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.onScroll();
  }

  getRouteState(outlet: { isActivated: boolean; activatedRoute?: { snapshot: { url: { path: string }[] } } }): string {
    return outlet?.activatedRoute?.snapshot.url.map((s) => s.path).join('/') || 'home';
  }

  isNavActive(section: NavSection): boolean {
    if (section.id === 'gallery') {
      return !this.isHomePage;
    }
    return this.isHomePage && this.activeSection === section.id;
  }

  navLink(section: NavSection): void {
    if (section.route) {
      this.router.navigate([section.route]);
      return;
    }
    if (!this.isHomePage) {
      this.router.navigate(['/'], { fragment: section.fragment || section.id }).then(() => {
        setTimeout(() => scrollToSection(section.fragment || section.id), 350);
      });
      return;
    }
    scrollToSection(section.fragment || section.id);
    this.closeMenu();
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onWhatsAppClick(): void {
    this.whatsappPulsing = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  private updateChrome(url: string): void {
    this.showSiteChrome = !isAdminApp(url);
    this.isHomePage = url === '/' || url === '';
    document.body.classList.toggle('admin-app', !this.showSiteChrome);
    if (!this.isHomePage) {
      this.activeSection = 'gallery';
    }
  }

  private handleAnchorClick = (event: Event): void => {
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest('a[href^="#"]') as HTMLAnchorElement | null;
    if (!anchor || anchor.getAttribute('href') === '#') return;

    const id = anchor.getAttribute('href')?.slice(1);
    if (!id || !document.getElementById(id)) return;

    event.preventDefault();
    if (!this.isHomePage) {
      this.router.navigate(['/'], { fragment: id }).then(() => {
        setTimeout(() => scrollToSection(id), 350);
      });
    } else {
      scrollToSection(id);
    }
    this.closeMenu();
  };
}
