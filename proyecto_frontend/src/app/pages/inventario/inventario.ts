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
  menuAbiertoId = signal<number | null>(null);
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

  // Cierra el menú desplegable si se hace clic fuera
  @HostListener('document:click')
  cerrarMenus(): void {
    if (this.menuAbiertoId() !== null) {
      this.menuAbiertoId.set(null);
    }
  }

  toggleMenu(id_pedido: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.menuAbiertoId() === id_pedido) {
      this.menuAbiertoId.set(null);
    } else {
      this.menuAbiertoId.set(id_pedido);
    }
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

  cambiarEstado(id_pedido: number, nuevoEstado: string): void {
    this.menuAbiertoId.set(null);

    this.pedidoService.cambiarEstado(id_pedido, nuevoEstado).subscribe({
      next: (pedidoActualizado) => {
        console.log(`Pedido #${id_pedido} actualizado a ${nuevoEstado}:`, pedidoActualizado);
        this.buscarConfirmados(); // Recarga la lista para reflejar el cambio
      },
      error: (error: any) => {
        console.error('Error al cambiar estado del pedido:', error);
        alert(`Error al cambiar el estado a ${nuevoEstado}.`);
      }
    });
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
