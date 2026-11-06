import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Producto } from '../../Models/Producto';
import { productoService } from '../../Service/productoService';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class ProductoComponent implements OnInit {
  private router = inject(Router);
  private productoService = inject(productoService);
  private cdr = inject(ChangeDetectorRef);

  // Signals para reactividad en Angular 21 (zoneless)
  nombreUsuario = signal<string>('Administrador');
  mostrarModalLogout = signal<boolean>(false);
  productos = signal<Producto[]>([]);
  cargando = signal<boolean>(false);
  errorMensaje = signal<string>('');

  // Control del modal y modo (crear o editar)
  mostrarModal = signal<boolean>(false);
  esEdicion = signal<boolean>(false);
  guardando = signal<boolean>(false);
  idProductoSeleccionado = signal<number | null>(null);

  // Término para el buscador
  terminoBusqueda: string = '';

  nuevoProducto: Producto = {
    nombre_producto: '',
    precio: 0,
    stock: 0,
    estado_producto: true,
  };

  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.mostrarTodos();
  }

  cargarUsuarioSesion(): void {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      const u = JSON.parse(sesion);
      this.nombreUsuario.set(u.nombre_usuario || 'Administrador');
    }
  }

  mostrarTodos(): void {
    this.cargando.set(true);
    this.errorMensaje.set('');

    this.productoService.buscarTodo().subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
        this.cdr.markForCheck();
        console.log('Productos cargados:', data);
      },
      error: (error) => {
        console.error('Error al obtener los productos:', error);
        this.errorMensaje.set('No se pudieron cargar los productos. Verifica que el backend esté encendido.');
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  // Busca productos por nombre consumiendo el endpoint del backend
  buscarPorNombre(): void {
    const nombre = this.terminoBusqueda.trim();
    if (!nombre) {
      this.mostrarTodos();
      return;
    }

    this.cargando.set(true);
    this.productoService.buscarPorNombre(nombre).subscribe({
      next: (data) => {
        this.productos.set(data);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al buscar producto por nombre:', error);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  limpiarBusqueda(): void {
    this.terminoBusqueda = '';
    this.mostrarTodos();
  }

  buscar_porNombre(nombre_producto: string): void {
    this.terminoBusqueda = nombre_producto;
    this.buscarPorNombre();
  }

  // Abre el modal para Crear
  abrirModal(): void {
    this.esEdicion.set(false);
    this.idProductoSeleccionado.set(null);
    this.nuevoProducto = {
      nombre_producto: '',
      precio: 0,
      stock: 0,
      estado_producto: true,
    };
    this.mostrarModal.set(true);
    this.cdr.markForCheck();
  }

  // Abre el modal para Editar buscando los datos por ID
  abrirModalEditar(id: number): void {
    this.esEdicion.set(true);
    this.idProductoSeleccionado.set(id);
    this.guardando.set(true);
    this.mostrarModal.set(true);
    this.cdr.markForCheck();

    // Consulta el producto por su ID en el backend
    this.productoService.buscarPorId(id).subscribe({
      next: (productoEncontrado) => {
        this.nuevoProducto = { ...productoEncontrado };
        this.guardando.set(false);
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al buscar producto por ID:', error);
        this.guardando.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.cdr.markForCheck();
  }

  // Guarda los cambios (creación o edición)
  guardar(): void {
    if (!this.nuevoProducto.nombre_producto.trim()) return;

    this.guardando.set(true);

    if (this.esEdicion()) {
      const id = this.idProductoSeleccionado();
      if (!id) return;

      this.productoService.editarProducto(id, this.nuevoProducto).subscribe({
        next: (data) => {
          console.log('Producto editado con éxito:', data);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarTodos(); // Refresca la tabla
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al editar el producto:', error);
          this.guardando.set(false);
          this.cdr.markForCheck();
        },
      });
    } else {
      this.productoService.crearProducto(this.nuevoProducto).subscribe({
        next: (data) => {
          console.log('Producto creado con éxito:', data);
          this.guardando.set(false);
          this.cerrarModal();
          this.mostrarTodos();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error al crear el producto:', error);
          this.guardando.set(false);
          this.cdr.markForCheck();
        },
      });
    }
  }

  cambiarEstado(idProducto: number): void {
    this.productoService.cambiarEstado(idProducto).subscribe({
      next: (data) => {
        console.log('Estado del producto cambiado:', data);
        this.mostrarTodos();
      },
      error: (error) => {
        console.error('Error al cambiar el estado del producto:', error);
      },
    });
  }

  // Modal y Control de Sesión
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
