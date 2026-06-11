import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-admin-loader',
  templateUrl: './admin-loader.component.html',
  styleUrls: ['./admin-loader.component.css'],
})
export class AdminLoaderComponent {
  @Input() message = 'Loading…';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inline = false;
}
