import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ProductoComponent } from './pages/producto/producto';
import { AdminComponent } from './pages/admin/admin';
import { VendedorComponent } from './pages/vendedor/vendedor';
import { InventarioComponent } from './pages/inventario/inventario';
import { PedidosComponent } from './pages/pedidos/pedidos';
import { authGuard, publicGuard } from './Guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [publicGuard]
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'producto',
    component: ProductoComponent,
    canActivate: [authGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'vendedor',
    component: VendedorComponent,
    canActivate: [authGuard],
    data: { roles: ['vendedor', 'admin'] }
  },
  {
    path: 'pedidos',
    component: PedidosComponent,
    canActivate: [authGuard],
    data: { roles: ['vendedor', 'admin', 'bodega', 'almacen', 'inventario'] }
  },
  {
    path: 'inventario',
    component: InventarioComponent,
    canActivate: [authGuard],
    data: { roles: ['bodega', 'almacen', 'inventario', 'admin'] }
  },
  { path: '**', redirectTo: 'login' }
];
