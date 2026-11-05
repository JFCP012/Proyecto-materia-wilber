import { Routes } from '@angular/router';
import { ProductoComponent } from './pages/producto/producto';

export const routes: Routes = [
  { path: '', redirectTo: 'producto', pathMatch: 'full' },
  { path: 'producto', component: ProductoComponent }
];
