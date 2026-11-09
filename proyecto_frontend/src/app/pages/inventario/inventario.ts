import { Component, inject, OnInit, signal, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { pedidoService } from '../../Service/pedidoService';
import { PedidoBodegaDTO } from '../../Models/PedidoBodegaDTO';

@Component({
  selector: 'app-inventario',
  imports: [CommonModule],
  templateUrl: './inventario.html',
  styleUrl: './inventario.css'
})
export class InventarioComponent implements OnInit {
  private router = inject(Router);
  private pedidoService = inject(pedidoService);
  private cdr = inject(ChangeDetectorRef);

  // Signals para reactividad en Angular 21 (Zoneless)
  nombreUsuario = signal<string>('Bodega');
  rolUsuario = signal<string>('Bodega');
  pedidos = signal<PedidoBodegaDTO[]>([]);
  cargando = signal<boolean>(false);
  errorMensaje = signal<string>('');
  menuGestionarAbiertoId = signal<number | null>(null);
  menuMotivoAbiertoId = signal<number | null>(null);
  estadoPendiente = signal<{ [id: number]: string }>({});
  mostrarModalLogout = signal<boolean>(false);

  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.buscarConfirmados();
  }

  cargarUsuarioSesion(): void {
    try {
      const sesion = localStorage.getItem('usuario');
      if (sesion) {
        const u = JSON.parse(sesion);
        this.nombreUsuario.set(u.nombre_usuario || 'Bodega');
        this.rolUsuario.set(u.rol || 'Bodega');
      }
    } catch (e) {
      console.warn('Error leyendo usuario de sesión:', e);
    }
  }

  // Cierra los menús desplegables si se hace clic fuera
  @HostListener('document:click')
  cerrarMenus(): void {
    if (this.menuGestionarAbiertoId() !== null) {
      this.menuGestionarAbiertoId.set(null);
    }
    if (this.menuMotivoAbiertoId() !== null) {
      this.menuMotivoAbiertoId.set(null);
    }
  }

  toggleMenuGestionar(id_pedido: number, event: MouseEvent): void {
    event.stopPropagation();
    this.menuMotivoAbiertoId.set(null);
    if (this.menuGestionarAbiertoId() === id_pedido) {
      this.menuGestionarAbiertoId.set(null);
    } else {
      this.menuGestionarAbiertoId.set(id_pedido);
    }
  }

  toggleMenuMotivo(id_pedido: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.estadoPendiente()[id_pedido] !== 'Cancelado') {
      return;
    }
    this.menuGestionarAbiertoId.set(null);
    if (this.menuMotivoAbiertoId() === id_pedido) {
      this.menuMotivoAbiertoId.set(null);
    } else {
      this.menuMotivoAbiertoId.set(id_pedido);
    }
  }

  seleccionarAccion(id_pedido: number, accion: string, event: MouseEvent): void {
    event.stopPropagation();
    this.menuGestionarAbiertoId.set(null);

    if (accion === 'Despachado') {
      const pendientes = { ...this.estadoPendiente() };
      delete pendientes[id_pedido];
      this.estadoPendiente.set(pendientes);

      this.cambiarEstado(id_pedido, 'Despachado', '');
    } else if (accion === 'Cancelado') {
      this.estadoPendiente.update((prev) => ({ ...prev, [id_pedido]: 'Cancelado' }));
      this.menuMotivoAbiertoId.set(id_pedido);
      this.cdr.markForCheck();
    }
  }

  confirmarCancelacionConMotivo(id_pedido: number, motivo: string, event: MouseEvent): void {
    event.stopPropagation();
    this.menuMotivoAbiertoId.set(null);

    const pendientes = { ...this.estadoPendiente() };
    delete pendientes[id_pedido];
    this.estadoPendiente.set(pendientes);

    this.cambiarEstado(id_pedido, 'Cancelado', motivo);
  }

  buscarConfirmados(): void {
    this.cargando.set(true);
    this.errorMensaje.set('');
    this.pedidoService.buscarPorEstado("Confirmado").subscribe({

      next: (data: PedidoBodegaDTO[]) => {
        const pedidosUnificados = this.unificarPedidos(data);
        this.pedidos.set(pedidosUnificados);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error al obtener pedidos:', error);
        this.errorMensaje.set('No se pudieron cargar los pedidos confirmados.');
        this.cargando.set(false);
        this.cdr.markForCheck();
      }
    });
  }

  // Agrupa múltiples productos de un mismo pedido en una sola fila
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
        // Unimos los productos especificando las unidades y el valor de cada uno
        existente.producto = `${existente.producto}, ${textoProducto}`;
        // Sumamos las cantidades totales
        existente.cantidad += cant;
        // Sumamos el total general del pedido
        existente.total += subtotal;
      }
    }

    return Array.from(mapa.values());
  }

  cambiarEstado(id_pedido: number, nuevoEstado: string, justificacion: string = ''): void {
    this.cerrarMenus();

    this.pedidoService.cambiarEstado(id_pedido, nuevoEstado, justificacion).subscribe({
      next: (pedidoActualizado) => {
        console.log(`Pedido #${id_pedido} actualizado a ${nuevoEstado}:`, pedidoActualizado);
        this.buscarConfirmados(); // Recarga la lista para reflejar el cambio
      },
      error: (error: any) => {
        console.error('Error al cambiar estado del pedido:', error);
        const msg = error?.error?.message || error?.error || `Error al cambiar el estado a ${nuevoEstado}.`;
        alert(`Error: ${msg}`);
      }
    });
  }

  irAPedidos(): void {
    this.router.navigate(['/pedidos']);
  }

  // Control de Sesión y Modal
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
