import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { adminLoginPath } from '../admin-context';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent implements OnInit {
  email = 'sirivruddhi@gmail.com';
  loggingOut = false;

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
