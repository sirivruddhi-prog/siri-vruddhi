import { Component } from '@angular/core';
import { AdminLoadingService } from '../admin-loading.service';

@Component({
  selector: 'app-admin-loading-bar',
  templateUrl: './admin-loading-bar.component.html',
  styleUrls: ['./admin-loading-bar.component.css'],
})
export class AdminLoadingBarComponent {
  loading$ = this.loading.loading$;

  constructor(private loading: AdminLoadingService) {}
}
