import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminService } from './admin.service';
import { AuthGuard } from './auth.guard';
import { LoginComponent } from './login/login.component';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { InquiryListComponent } from './inquiries/inquiry-list.component';
import { InquiryDetailComponent } from './inquiries/inquiry-detail.component';

@NgModule({
  declarations: [
    LoginComponent,
    AdminLayoutComponent,
    InquiryListComponent,
    InquiryDetailComponent,
  ],
  imports: [CommonModule, FormsModule, HttpClientModule, AdminRoutingModule],
  providers: [AdminService, AuthGuard],
})
export class AdminModule {}
