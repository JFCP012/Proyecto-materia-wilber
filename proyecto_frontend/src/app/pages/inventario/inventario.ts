import { Component, inject, OnInit, signal, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { pedidoService } from '../../Service/pedidoService';
import { Pedido } from '../../Models/Pedido';

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
  pedidos = signal<Pedido[]>([]);
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
      next: (data: Pedido[]) => {
        this.pedidos.set(data);
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
