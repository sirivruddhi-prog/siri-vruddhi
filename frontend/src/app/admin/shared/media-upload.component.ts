import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AdminService, MediaUploadResponse } from '../admin.service';

@Component({
  selector: 'app-media-upload',
  templateUrl: './media-upload.component.html',
  styleUrls: ['../admin-theme.css', './media-upload.component.css'],
})
export class MediaUploadComponent {
  @Input() previewUrl = '';
  @Input() label = 'Upload image';
  @Output() uploaded = new EventEmitter<MediaUploadResponse>();

  uploading = false;
  error = '';

  constructor(private admin: AdminService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || this.uploading) {
      return;
    }

    this.uploading = true;
    this.error = '';

    this.admin.uploadMedia(file).subscribe({
      next: (asset) => {
        this.previewUrl = asset.url;
        this.uploading = false;
        this.uploaded.emit(asset);
        input.value = '';
      },
      error: (err) => {
        this.uploading = false;
        this.error = err?.error?.error || 'Upload failed.';
        input.value = '';
      },
    });
  }
}
