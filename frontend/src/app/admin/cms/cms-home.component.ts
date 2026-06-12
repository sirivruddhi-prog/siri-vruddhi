import { Component, OnInit } from '@angular/core';
import { AdminService, MediaUploadResponse } from '../admin.service';

@Component({
  selector: 'app-cms-home',
  templateUrl: './cms-home.component.html',
  styleUrls: ['../admin-theme.css', '../admin-shared.css'],
})
export class CmsHomeComponent implements OnInit {
  hero: any = {};
  heroTaglinesText = '';
  stats: any = { items: [] };
  teaser: any = {};
  intro: any = { features: [] };
  about: any = { paragraphs: [] };
  spaces: any = { items: [] };
  facilities: any = { items: [] };
  reviews: any = { manualItems: [] };
  dining: any = { tags: [] };
  contactPanel: any = {};

  openSection = 'hero';
  loading = true;
  savingSection = '';
  message = '';
  error = '';

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    const sections = ['hero', 'stats', 'teaser', 'intro', 'about', 'spaces', 'facilities', 'reviews', 'dining', 'contactPanel'];
    let loaded = 0;
    sections.forEach((key) => {
      this.admin.getSiteSection(key).subscribe({
        next: (res) => {
          (this as any)[key === 'contactPanel' ? 'contactPanel' : key] = res.content;
          if (key === 'hero') {
            const heroContent = res.content as { taglines?: string[] };
            this.heroTaglinesText = (heroContent.taglines || []).join('\n');
          }
          loaded += 1;
          if (loaded === sections.length) this.loading = false;
        },
        error: () => {
          this.error = 'Unable to load home page content.';
          this.loading = false;
        },
      });
    });
  }

  toggle(section: string): void {
    this.openSection = this.openSection === section ? '' : section;
  }

  onHeroTaglinesChange(value: string): void {
    this.heroTaglinesText = value;
    this.hero.taglines = value
      .split('\n')
      .map((line: string) => line.trim())
      .filter(Boolean);
  }

  save(section: string): void {
    if (this.savingSection) return;
    this.savingSection = section;
    this.message = '';
    this.error = '';
    if (section === 'hero') {
      this.onHeroTaglinesChange(this.heroTaglinesText);
    }
    const content = (this as any)[section];
    this.admin.saveSiteSection(section, content).subscribe({
      next: () => {
        this.savingSection = '';
        this.message = `${section} saved successfully.`;
      },
      error: () => {
        this.savingSection = '';
        this.error = `Unable to save ${section}.`;
      },
    });
  }

  addStat(): void {
    this.stats.items.push({ value: '', label: '' });
  }

  removeStat(index: number): void {
    this.stats.items.splice(index, 1);
  }

  addHeroSlide(): void {
    this.hero.slides.push({ file: '', alt: '' });
  }

  removeHeroSlide(index: number): void {
    this.hero.slides.splice(index, 1);
  }

  addIntroFeature(): void {
    this.intro.features.push({ icon: '✨', title: '', desc: '', imageFile: '' });
  }

  removeIntroFeature(index: number): void {
    this.intro.features.splice(index, 1);
  }

  addSpace(): void {
    this.spaces.items.push({ icon: '✨', title: '', imageFile: '', desc: '', detail: '' });
  }

  removeSpace(index: number): void {
    this.spaces.items.splice(index, 1);
  }

  addFacility(): void {
    this.facilities.items.push({ icon: '✨', title: '', desc: '' });
  }

  removeFacility(index: number): void {
    this.facilities.items.splice(index, 1);
  }

  addReview(): void {
    this.reviews.manualItems.push({ authorName: '', rating: 5, text: '', relativeTime: '' });
  }

  removeReview(index: number): void {
    this.reviews.manualItems.splice(index, 1);
  }

  addDiningTag(): void {
    this.dining.tags.push('');
  }

  removeDiningTag(index: number): void {
    this.dining.tags.splice(index, 1);
  }

  addAboutParagraph(): void {
    this.about.paragraphs.push('');
  }

  removeAboutParagraph(index: number): void {
    this.about.paragraphs.splice(index, 1);
  }

  applySlideUpload(asset: MediaUploadResponse, slide: { url?: string; mediaId?: number; file?: string }): void {
    slide.url = asset.url;
    slide.mediaId = asset.id;
    slide.file = asset.filename;
  }

  applyAboutUpload(asset: MediaUploadResponse): void {
    this.about.imageUrl = asset.url;
    this.about.mediaId = asset.id;
    this.about.imageFile = asset.filename;
  }

  applyIntroUpload(asset: MediaUploadResponse, feature: { imageUrl?: string; mediaId?: number; imageFile?: string }): void {
    feature.imageUrl = asset.url;
    feature.mediaId = asset.id;
    feature.imageFile = asset.filename;
  }

  applySpaceUpload(asset: MediaUploadResponse, space: { imageUrl?: string; mediaId?: number; imageFile?: string }): void {
    space.imageUrl = asset.url;
    space.mediaId = asset.id;
    space.imageFile = asset.filename;
  }

  applyDiningUpload(asset: MediaUploadResponse): void {
    this.dining.imageUrl = asset.url;
    this.dining.mediaId = asset.id;
    this.dining.imageFile = asset.filename;
  }
}
