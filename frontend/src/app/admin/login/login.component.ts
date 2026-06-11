import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from '../admin.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  password = '';
  loading = false;
  error = '';

  constructor(private admin: AdminService, private router: Router) {}

  submit(): void {
    if (!this.password || this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';

    this.admin.login(this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/inquiries']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.error || 'Unable to sign in. Please try again.';
      },
    });
  }
}
