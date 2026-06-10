import { Component, HostListener, OnInit } from '@angular/core';
import { SITE_CONTACT } from './site-contact';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Siri Vruddhi';
  contact = SITE_CONTACT;
  headerScrolled = false;
  menuOpen = false;

  ngOnInit(): void {
    this.updateHeaderScroll();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.updateHeaderScroll();
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
