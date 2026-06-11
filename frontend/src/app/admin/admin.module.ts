import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminService } from './admin.service';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';
import { LoginComponent } from './login/login.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { InquiryListComponent } from './inquiries/inquiry-list.component';
import { InquiryDetailComponent } from './inquiries/inquiry-detail.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CmsContactComponent } from './cms/cms-contact.component';
import { CmsHomeComponent } from './cms/cms-home.component';
import { CmsGalleryComponent } from './cms/cms-gallery.component';
import { MediaUploadComponent } from './shared/media-upload.component';

@NgModule({
  declarations: [
    LoginComponent,
    AdminLayoutComponent,
    InquiryListComponent,
    InquiryDetailComponent,
    DashboardComponent,
    CmsContactComponent,
    CmsHomeComponent,
    CmsGalleryComponent,
    MediaUploadComponent,
  ],
  imports: [CommonModule, FormsModule, HttpClientModule, AdminRoutingModule],
  providers: [AdminService, AuthGuard, LoginGuard],
})
export class AdminModule {}
