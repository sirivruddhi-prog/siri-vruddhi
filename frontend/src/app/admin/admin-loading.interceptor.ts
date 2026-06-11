import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AdminLoadingService } from './admin-loading.service';

@Injectable()
export class AdminLoadingInterceptor implements HttpInterceptor {
  private readonly adminApiPrefix = `${environment.apiUrl}/admin`;

  constructor(private loading: AdminLoadingService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!req.url.startsWith(this.adminApiPrefix)) {
      return next.handle(req);
    }

    this.loading.start();
    return next.handle(req).pipe(finalize(() => this.loading.stop()));
  }
}
