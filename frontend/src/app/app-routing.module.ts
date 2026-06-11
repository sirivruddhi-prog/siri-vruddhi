import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminRedirectComponent } from './admin/admin-redirect.component';
import { isAdminSubdomain, isLocalDevHost } from './admin/admin-context';
import { HomeComponent } from './home/home.component';
import { GalleryComponent } from './gallery/gallery.component';

function buildRoutes(): Routes {
  if (isAdminSubdomain()) {
    return [
      {
        path: '',
        loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
      },
      { path: '**', redirectTo: '' },
    ];
  }

  const publicRoutes: Routes = [
    { path: '', component: HomeComponent, title: 'Siri Vruddhi — Event Venue' },
    { path: 'gallery', component: GalleryComponent, title: 'Gallery — Siri Vruddhi' },
  ];

  if (isLocalDevHost()) {
    publicRoutes.push({
      path: 'admin',
      loadChildren: () => import('./admin/admin.module').then((m) => m.AdminModule),
    });
  } else {
    publicRoutes.push({ path: 'admin', component: AdminRedirectComponent });
    publicRoutes.push({ path: 'admin/**', component: AdminRedirectComponent });
  }

  publicRoutes.push({ path: '**', redirectTo: '' });
  return publicRoutes;
}

const routes = buildRoutes();

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
