import { Component, OnInit } from '@angular/core';
import { AdminService, MediaUploadResponse } from '../admin.service';

interface GalleryItemDraft {
  file?: string;
  url?: string;
  mediaId?: number;
  category: string;
  title: string;
  visible: boolean;
}

interface GalleryContent {
  pageHeroFile?: string;
  pageHeroUrl?: string;
  pageHeroMediaId?: number;
  pageHeroAlt: string;
  pageTitle: string;
  pageLead: string;
  ctaTitle: string;
  ctaLead: string;
  categories: string[];
  items: GalleryItemDraft[];
}

@Component({
  selector: 'app-cms-gallery',
  templateUrl: './cms-gallery.component.html',
  styleUrls: ['../admin-theme.css', '../admin-shared.css'],
})
export class CmsGalleryComponent implements OnInit {
  content: GalleryContent = {
    pageHeroAlt: '',
    pageTitle: 'Gallery',
    pageLead: '',
    ctaTitle: '',
    ctaLead: '',
    categories: [],
    items: [],
  };
  loading = true;
  saving = false;
  message = '';
  error = '';

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getSiteSection<GalleryContent>('gallery').subscribe({
      next: (res) => {
        this.content = res.content;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load gallery content.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.message = '';
    this.error = '';
    this.admin.saveSiteSection('gallery', this.content).subscribe({
      next: () => {
        this.saving = false;
        this.message = 'Gallery saved. Uploaded images are live on the website.';
      },
      error: () => {
        this.saving = false;
        this.error = 'Unable to save gallery.';
      },
    });
  }

  applyHeroUpload(asset: MediaUploadResponse): void {
    this.content.pageHeroUrl = asset.url;
    this.content.pageHeroMediaId = asset.id;
    this.content.pageHeroFile = asset.filename;
  }

  applyItemUpload(asset: MediaUploadResponse, item: GalleryItemDraft): void {
    item.url = asset.url;
    item.mediaId = asset.id;
    item.file = asset.filename;
  }

  addItem(): void {
    this.content.items.push({
      category: this.content.categories[0] || 'Exterior',
      title: '',
      visible: true,
    });
  }

  removeItem(index: number): void {
    this.content.items.splice(index, 1);
  }

  addCategory(): void {
    this.content.categories.push('');
  }

  removeCategory(index: number): void {
    this.content.categories.splice(index, 1);
  }

  itemPreview(item: GalleryItemDraft): string {
    return item.url || '';
  }
}
