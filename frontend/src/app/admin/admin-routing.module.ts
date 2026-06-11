import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout/admin-layout.component';
import { AuthGuard } from './auth.guard';
import { CmsContactComponent } from './cms/cms-contact.component';
import { CmsGalleryComponent } from './cms/cms-gallery.component';
import { CmsHomeComponent } from './cms/cms-home.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginGuard } from './login.guard';
import { InquiryDetailComponent } from './inquiries/inquiry-detail.component';
import { InquiryListComponent } from './inquiries/inquiry-list.component';
import { LoginComponent } from './login/login.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard], title: 'Admin Login — Siri Vruddhi' },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Dashboard — Siri Vruddhi Admin' },
      { path: 'inquiries', component: InquiryListComponent, title: 'Inquiries — Siri Vruddhi Admin' },
      { path: 'inquiries/:id', component: InquiryDetailComponent, title: 'Inquiry — Siri Vruddhi Admin' },
      { path: 'website/contact', component: CmsContactComponent, title: 'Contact CMS — Siri Vruddhi Admin' },
      { path: 'website/home', component: CmsHomeComponent, title: 'Home CMS — Siri Vruddhi Admin' },
      { path: 'website/gallery', component: CmsGalleryComponent, title: 'Gallery CMS — Siri Vruddhi Admin' },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
