import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../Models/Producto';
import { productoService } from '../../Service/productoService';

@Component({
  selector: 'app-stock',
  imports: [CommonModule, FormsModule],
  templateUrl: './stock.html',
  styleUrl: './stock.css',
})
export class StockComponent implements OnInit {
  private router = inject(Router);
  private productoService = inject(productoService);
  private cdr = inject(ChangeDetectorRef);

  // Signals de estado
  nombreUsuario = signal<string>('Usuario');
  rolUsuario = signal<string>('Bodega');
  productos = signal<Producto[]>([]);
  cargando = signal<boolean>(false);
  guardando = signal<boolean>(false);
  errorMensaje = signal<string>('');
  mensajeExito = signal<string>('');
  ordenAscendenteId = signal<boolean>(true);

  // Búsqueda
  terminoBusqueda: string = '';

  // Modal para cambiar stock
  mostrarModalStock = signal<boolean>(false);
  productoSeleccionado = signal<Producto | null>(null);
  nuevoStock: number = 0;
  errorModalStock = signal<string>('');

  // Logout modal
  mostrarModalLogout = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.mostrarTodos();
  }

  cargarUsuarioSesion(): void {
    try {
      const sesion = localStorage.getItem('usuario');
      if (sesion) {
        const u = JSON.parse(sesion);
        this.nombreUsuario.set(u.nombre_usuario || 'Usuario');
        this.rolUsuario.set(u.rol || 'Bodega');
      }
    } catch (e) {
      console.warn('Error leyendo sesión:', e);
    }
  }

  volver(): void {
    const rol = this.rolUsuario().toLowerCase();
    if (rol.includes('admin')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/inventario']);
    }
  }

  ordenarPorId(lista: Producto[]): Producto[] {
    const orden = this.ordenAscendenteId() ? 1 : -1;
    return [...lista].sort((a, b) => {
      const idA = Number(a.id_producto) || 0;
      const idB = Number(b.id_producto) || 0;
      return (idA - idB) * orden;
    });
  }

  toggleOrdenId(): void {
    this.ordenAscendenteId.update((actual) => !actual);
    this.productos.set(this.ordenarPorId(this.productos()));
    this.cdr.markForCheck();
  }

  mostrarTodos(): void {
    this.cargando.set(true);
    this.errorMensaje.set('');

    this.productoService.buscarTodo().subscribe({
      next: (data) => {
        this.productos.set(this.ordenarPorId(data));
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        this.errorMensaje.set('No se pudieron cargar los productos. Verifica que el backend esté disponible.');
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  buscarPorNombre(): void {
    const nombre = this.terminoBusqueda.trim();
    if (!nombre) {
      this.mostrarTodos();
      return;
    }

    this.cargando.set(true);
    this.productoService.buscarPorNombre(nombre).subscribe({
      next: (data) => {
        this.productos.set(this.ordenarPorId(data));
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al buscar por nombre:', error);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.mostrarTodos();
  }

  abrirModalStock(producto: Producto): void {
    this.productoSeleccionado.set(producto);
    this.nuevoStock = producto.stock ?? 0;
    this.errorModalStock.set('');
    this.mostrarModalStock.set(true);
    this.cdr.markForCheck();
  }

  bloquearSignoMenos(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e' || event.key === '+' || event.key === '.') {
      event.preventDefault();
    }
  }

  cerrarModalStock(): void {
    this.mostrarModalStock.set(false);
    this.productoSeleccionado.set(null);
    this.errorModalStock.set('');
    this.cdr.markForCheck();
  }

  guardarStock(): void {
    const prod = this.productoSeleccionado();
    if (!prod || prod.id_producto === undefined || prod.id_producto === null) {
      return;
    }

    if (this.nuevoStock === null || this.nuevoStock === undefined || this.nuevoStock < 0) {
      this.errorModalStock.set('El stock debe ser un número mayor o igual a 0.');
      return;
    }

    this.guardando.set(true);
    this.errorModalStock.set('');

    this.productoService.cambiarStock(prod.id_producto, this.nuevoStock).subscribe({
      next: (productoActualizado) => {
        this.guardando.set(false);
        this.cerrarModalStock();

        // Actualiza el producto en la lista en memoria
        const listaActualizada = this.productos().map((p) =>
          p.id_producto === prod.id_producto
            ? { ...p, stock: productoActualizado?.stock ?? this.nuevoStock }
            : p
        );
        this.productos.set(this.ordenarPorId(listaActualizada));

        this.mensajeExito.set(`Stock de "${prod.nombre_producto}" actualizado a ${this.nuevoStock} unidades.`);
        setTimeout(() => {
          this.mensajeExito.set('');
          this.cdr.markForCheck();
        }, 3500);

        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al actualizar stock con cambiarStock:', error);
        const msg = error?.error?.message || error?.error || 'No se pudo actualizar el stock en el servidor.';
        this.errorModalStock.set(`Error: ${msg}`);
        this.guardando.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  // Logout modal
  abrirModalLogout(): void {
    this.mostrarModalLogout.set(true);
  }

  cerrarModalLogout(): void {
    this.mostrarModalLogout.set(false);
  }

  confirmarCerrarSesion(): void {
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }
}

