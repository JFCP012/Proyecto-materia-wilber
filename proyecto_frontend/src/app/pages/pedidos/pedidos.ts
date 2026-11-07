import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { pedidoService } from '../../Service/pedidoService';
import { PedidoBodegaDTO } from '../../Models/PedidoBodegaDTO';

@Component({
  selector: 'app-pedidos',
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})
export class PedidosComponent implements OnInit {
  private router = inject(Router);
  private pedidoService = inject(pedidoService);
  private cdr = inject(ChangeDetectorRef);

  nombreUsuario = signal<string>('Vendedor');
  rolUsuario = signal<string>('Vendedor');
  mostrarModalLogout = signal<boolean>(false);

  // Estados de la tabla de pedidos y filtros
  pedidos = signal<PedidoBodegaDTO[]>([]);
  cargando = signal<boolean>(false);
  errorMensaje = signal<string>('');
  estadoActual = signal<string>('Todos'); // 'Todos' por defecto

  // Búsqueda por Cliente y Cédula
  terminoNombre = signal<string>('');
  terminoCedula = signal<string>('');
  busquedaActiva = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.cargarPedidos('Todos');
  }

  cargarUsuarioSesion(): void {
    try {
      const sesion = localStorage.getItem('usuario');
      if (sesion) {
        const u = JSON.parse(sesion);
        this.nombreUsuario.set(u.nombre_usuario || 'Vendedor');
        this.rolUsuario.set(u.rol || 'Vendedor');
      }
    } catch (e) {
      console.warn('Error leyendo usuario:', e);
    }
  }

  volver(): void {
    if (this.rolUsuario().toLowerCase().includes('admin')) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/vendedor']);
    }
  }

  cargarPedidos(estado: string = this.estadoActual()): void {
    this.estadoActual.set(estado);
    this.cargando.set(true);
    this.errorMensaje.set('');

    this.pedidoService.buscarPorEstado(estado).subscribe({
      next: (data: PedidoBodegaDTO[]) => {
        const pedidosUnificados = this.unificarPedidos(data);
        this.pedidos.set(pedidosUnificados);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
        this.errorMensaje.set('Error al cargar los pedidos.');
        this.cargando.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  buscarPorNombreOCedula(): void {
    const nombre = this.terminoNombre().trim();
    const cedula = this.terminoCedula().trim();

    if (!nombre && !cedula) {
      this.cargarPedidos(this.estadoActual());
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');
    this.busquedaActiva.set(true);

    this.pedidoService.filtrarPorNombre(nombre, cedula).subscribe({
      next: (data: PedidoBodegaDTO[]) => {
        const pedidosUnificados = this.unificarPedidos(data);
        this.pedidos.set(pedidosUnificados);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error al buscar por nombre/cédula:', error);
        this.errorMensaje.set('Error al buscar pedidos por cliente o cédula.');
        this.cargando.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  limpiarBusqueda(): void {
    this.terminoNombre.set('');
    this.terminoCedula.set('');
    this.busquedaActiva.set(false);
    this.cargarPedidos(this.estadoActual());
  }

  private unificarPedidos(lista: PedidoBodegaDTO[]): PedidoBodegaDTO[] {
    const mapa = new Map<number, PedidoBodegaDTO>();

    for (const item of lista) {
      const cant = Number(item.cantidad) || 0;
      const subtotal = Number(item.total) || 0;
      const precioFormateado = '$' + Math.round(subtotal).toLocaleString();
      const textoProducto = `${item.producto} (${cant} ${cant === 1 ? 'unidad' : 'unidades'} - ${precioFormateado})`;

      if (!mapa.has(item.id_pedido)) {
        mapa.set(item.id_pedido, {
          ...item,
          producto: textoProducto,
          cantidad: cant,
          total: subtotal
        });
      } else {
        const existente = mapa.get(item.id_pedido)!;
        existente.producto = `${existente.producto}, ${textoProducto}`;
        existente.cantidad += cant;
        existente.total += subtotal;
      }
    }

    return Array.from(mapa.values());
  }

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

