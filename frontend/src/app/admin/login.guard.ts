import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { adminDashboardPath } from './admin-context';
import { AdminService } from './admin.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private admin: AdminService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.admin.getSession().pipe(
      map(() => this.router.createUrlTree(adminDashboardPath())),
      catchError(() => of(true))
    );
  }
}
