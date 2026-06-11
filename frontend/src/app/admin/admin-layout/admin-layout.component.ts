import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
        this.router.navigate(['/admin/login']);
      },
    });
  }

  logout(): void {
    if (this.loggingOut) {
      return;
    }
    this.loggingOut = true;
    this.admin.logout().subscribe({
      next: () => {
        this.loggingOut = false;
        this.router.navigate(['/admin/login']);
      },
      error: () => {
        this.loggingOut = false;
        this.router.navigate(['/admin/login']);
      },
    });
  }
}
