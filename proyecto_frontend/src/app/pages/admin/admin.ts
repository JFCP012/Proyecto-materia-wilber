import { Component, inject, OnInit, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { pedidoService } from '../../Service/pedidoService';
import { PedidoBodegaDTO } from '../../Models/PedidoBodegaDTO';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin.html',
  styleUrl: './admin.css'
})
export class AdminComponent implements OnInit {
  private router = inject(Router);
  private pedidoService = inject(pedidoService);
  private cdr = inject(ChangeDetectorRef);

  nombreUsuario = signal<string>('Administrador');
  mostrarModalLogout = signal<boolean>(false);

  // Estados de la tabla de pedidos y filtros
  pedidos = signal<PedidoBodegaDTO[]>([]);
  cargando = signal<boolean>(false);
  errorMensaje = signal<string>('');
  estadoActual = signal<string>('Todos'); // 'Todos' por defecto
  fechaSeleccionada = signal<string>(''); // formato 'YYYY-MM-DD'
  mesSeleccionado = signal<string>('');   // formato 'YYYY-MM'

  // Búsqueda por Cliente y Cédula
  terminoNombre = signal<string>('');
  terminoCedula = signal<string>('');
  busquedaActiva = signal<boolean>(false);

  // Total vendido acumulado según los filtros activos (excluyendo cancelados)
  totalVendido = computed<number>(() => {
    return this.pedidos()
      .filter(p => p.estado_pedido?.trim().toLowerCase() !== 'cancelado')
      .reduce((acc, p) => acc + (Number(p.total) || 0), 0);
  });

  totalVendidoFormateado = computed<string>(() => {
    return '$' + Math.round(this.totalVendido()).toLocaleString();
  });

  cantidadPedidos = computed<number>(() => {
    return this.pedidos().length;
  });

  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.cargarPedidos('Todos');
  }

  cargarUsuarioSesion(): void {
    try {
      const sesion = localStorage.getItem('usuario');
      if (sesion) {
        const u = JSON.parse(sesion);
        this.nombreUsuario.set(u.nombre_usuario || 'Administrador');
      }
    } catch (e) {
      console.warn('Error leyendo usuario:', e);
    }
  }

  alCambiarDia(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.fechaSeleccionada.set(valor);
    this.mesSeleccionado.set('');
    this.cargarPedidos(this.estadoActual());
  }

  alCambiarMes(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.mesSeleccionado.set(valor);
    this.fechaSeleccionada.set('');
    this.cargarPedidos(this.estadoActual());
  }

  filtrarHoy(): void {
    const hoy = new Date().toISOString().split('T')[0];
    this.fechaSeleccionada.set(hoy);
    this.mesSeleccionado.set('');
    this.cargarPedidos(this.estadoActual());
  }

  filtrarEsteMes(): void {
    const d = new Date();
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    this.mesSeleccionado.set(`${anio}-${mes}`);
    this.fechaSeleccionada.set('');
    this.cargarPedidos(this.estadoActual());
  }

  limpiarFiltroFecha(): void {
    this.fechaSeleccionada.set('');
    this.mesSeleccionado.set('');
    this.terminoNombre.set('');
    this.terminoCedula.set('');
    this.busquedaActiva.set(false);
    this.cargarPedidos(this.estadoActual());
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

    let fecha = '';
    let anio = '';
    let mes = '';

    if (this.fechaSeleccionada()) {
      fecha = this.fechaSeleccionada();
    } else if (this.mesSeleccionado()) {
      const partes = this.mesSeleccionado().split('-');
      if (partes.length === 2) {
        anio = partes[0];
        mes = String(parseInt(partes[1], 10));
      }
    }

    this.pedidoService.filtrarPorNombre(nombre, cedula, this.estadoActual(), fecha, anio, mes).subscribe({
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

  cargarPedidos(estado: string = this.estadoActual()): void {
    this.estadoActual.set(estado);

    if (this.busquedaActiva() && (this.terminoNombre().trim() || this.terminoCedula().trim())) {
      this.buscarPorNombreOCedula();
      return;
    }

    this.cargando.set(true);
    this.errorMensaje.set('');

    let fecha = '';
    let anio = '';
    let mes = '';

    if (this.fechaSeleccionada()) {
      fecha = this.fechaSeleccionada();
    } else if (this.mesSeleccionado()) {
      const partes = this.mesSeleccionado().split('-');
      anio = partes[0];
      mes = String(parseInt(partes[1], 10));
    }

    this.pedidoService.buscarPorEstado(estado, fecha, anio, mes).subscribe({
      next: (data: PedidoBodegaDTO[]) => {
        const pedidosUnificados = this.unificarPedidos(data);
        this.pedidos.set(pedidosUnificados);
        this.cargando.set(false);
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error al cargar pedidos:', error);
        this.errorMensaje.set(
          estado === 'Todos'
            ? 'Error al cargar los pedidos.'
            : `Error al cargar pedidos con estado "${estado}".`
        );
        this.cargando.set(false);
        this.cdr.markForCheck();
      }
    });
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
