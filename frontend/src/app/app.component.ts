import { Component, HostListener } from '@angular/core';
import { SITE_CONTACT } from './site-contact';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Siri Vruddhi';
  contact = SITE_CONTACT;
  headerScrolled = false;
  menuOpen = false;

  @HostListener('window:scroll')
  onScroll(): void {
    this.headerScrolled = window.scrollY > 48;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }
}
