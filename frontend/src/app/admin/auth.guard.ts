import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AdminService } from './admin.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private admin: AdminService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.admin.getSession().pipe(
      map(() => true),
      catchError(() => of(this.router.createUrlTree(['/admin/login'])))
    );
  }
}
