import { Component, OnInit } from '@angular/core';
import { redirectToAdminPortal } from './admin-context';

@Component({
  selector: 'app-admin-redirect',
  template: '<p class="admin-redirect-msg">Redirecting to admin portal…</p>',
  styles: ['.admin-redirect-msg { padding: 2rem; text-align: center; color: #6b5344; }'],
})
export class AdminRedirectComponent implements OnInit {
  ngOnInit(): void {
    redirectToAdminPortal();
  }
}
