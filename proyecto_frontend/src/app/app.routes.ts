import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ProductoComponent } from './pages/producto/producto';
import { AdminComponent } from './pages/admin/admin';
import { VendedorComponent } from './pages/vendedor/vendedor';
import { InventarioComponent } from './pages/inventario/inventario';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'vendedor', component: VendedorComponent },
  { path: 'inventario', component: InventarioComponent },
  { path: 'producto', component: ProductoComponent }
];
