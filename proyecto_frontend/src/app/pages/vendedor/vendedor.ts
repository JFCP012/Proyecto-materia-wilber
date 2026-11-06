import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { pedidoService } from '../../Service/pedidoService';
import { productoService } from '../../Service/productoService';
import { Producto } from '../../Models/Producto';

// ==========================================================
// 1. DTOs: Estructura exacta que espera el Backend en Spring Boot
// ==========================================================
export interface DetallePedidoDTO {
  idProducto: number;
  nombreProducto?: string; // Para mostrar el nombre en el buscador
  cantidad: number;
}

export interface PedidoDTO {
  idUsuario: number;
  nombreCliente: string;
  direccionCliente: string;
  detalles: DetallePedidoDTO[];
}

@Component({
  selector: 'app-vendedor',
  imports: [CommonModule, FormsModule],
  templateUrl: './vendedor.html',
  styleUrl: './vendedor.css'
})
export class VendedorComponent implements OnInit {
  // ========================================================
  // 2. INYECCIÓN DE SERVICIOS
  // ========================================================
  private pedidoService = inject(pedidoService);
  private productoService = inject(productoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  // ========================================================
  // 3. ESTADO DEL FORMULARIO Y VARIABLES
  // ========================================================
  // El DTO principal con los datos que se enviarán:
  pedidoDTO: PedidoDTO = {
    idUsuario: null as any,
    nombreCliente: '',
    direccionCliente: '',
    detalles: [
      { idProducto: 0, nombreProducto: '', cantidad: null as any }
    ]
  };

  // Datos para visualización en la interfaz:
  nombreUsuario = signal<string>('Vendedor');
  productos = signal<Producto[]>([]);
  guardando = signal<boolean>(false);
  mensajeExito = signal<string>('');
  mensajeError = signal<string>('');
  mostrarModalLogout = signal<boolean>(false);

  // ========================================================
  // 4. CICLO DE VIDA (Carga inicial)
  // ========================================================
  ngOnInit(): void {
    this.cargarUsuarioSesion();
    this.cargarCatalogoProductos();
  }

  cargarUsuarioSesion(): void {
    const sesion = localStorage.getItem('usuario');
    if (sesion) {
      const u = JSON.parse(sesion);
      this.pedidoDTO.idUsuario = u.id_usuario || null;
      this.nombreUsuario.set(u.nombre_usuario || 'Vendedor');
    }
  }

  cargarCatalogoProductos(): void {
    this.productoService.buscarTodo().subscribe({
      next: (data) => {
        // Solo traemos productos que estén activos
        this.productos.set(data.filter(p => p.estado_producto !== false));
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error al cargar productos:', err)
    });
  }

  // ========================================================
  // 5. MÉTODOS DE LA TABLA (Detalles del Pedido)
  // ========================================================
  // Detecta cuando el usuario escribe o elige un producto de la lista
  seleccionarProducto(indice: number): void {
    const detalle = this.pedidoDTO.detalles[indice];
    const texto = (detalle.nombreProducto || '').trim().toLowerCase();

    const prod = this.productos().find(p => p.nombre_producto.toLowerCase() === texto);
    if (prod) {
      detalle.idProducto = prod.id_producto!;
      detalle.nombreProducto = prod.nombre_producto;
    } else {
      detalle.idProducto = 0; // Si escribe algo que no existe
    }
    this.cdr.markForCheck();
  }

  // Obtiene el producto por ID para leer su precio y stock actual
  obtenerProducto(idProducto: number): Producto | undefined {
    return this.productos().find(p => p.id_producto === idProducto);
  }

  agregarProducto(): void {
    this.pedidoDTO.detalles.push({ idProducto: 0, nombreProducto: '', cantidad: null as any });
  }

  eliminarProducto(indice: number): void {
    if (this.pedidoDTO.detalles.length > 1) {
      this.pedidoDTO.detalles.splice(indice, 1);
    } else {
      this.pedidoDTO.detalles[0] = { idProducto: 0, nombreProducto: '', cantidad: null as any };
    }
  }

  // ========================================================
  // 6. CÁLCULO DE MONTOS
  // ========================================================
  calcularSubtotal(detalle: DetallePedidoDTO): number {
    const prod = this.obtenerProducto(detalle.idProducto);
    return prod && detalle.cantidad ? prod.precio * detalle.cantidad : 0;
  }

  calcularTotal(): number {
    return this.pedidoDTO.detalles.reduce((total, d) => total + this.calcularSubtotal(d), 0);
  }

  // ========================================================
  // 7. ENVÍO DEL PEDIDO AL BACKEND (Crear Pedido)
  // ========================================================
  crearPedido(): void {
    this.mensajeError.set('');
    this.mensajeExito.set('');

    // A. Validar campos obligatorios
    if (!this.pedidoDTO.idUsuario || !this.pedidoDTO.nombreCliente.trim() || !this.pedidoDTO.direccionCliente.trim()) {
      this.mensajeError.set('Por favor completa los datos del cliente y vendedor.');
      return;
    }

    // B. Validar que haya al menos un producto con cantidad
    const lineasValidas = this.pedidoDTO.detalles.filter(d => d.idProducto > 0 && d.cantidad > 0);
    if (lineasValidas.length === 0) {
      this.mensajeError.set('Selecciona al menos un producto válido y su cantidad.');
      return;
    }

    // C. Validar stock disponible
    for (const d of lineasValidas) {
      const prod = this.obtenerProducto(d.idProducto);
      if (prod && d.cantidad > prod.stock) {
        this.mensajeError.set(`Stock insuficiente para "${prod.nombre_producto}". Disponibles: ${prod.stock}`);
        return;
      }
    }

    // D. Armar payload limpio del DTO para Spring Boot
    const payload = {
      idUsuario: Number(this.pedidoDTO.idUsuario),
      nombreCliente: this.pedidoDTO.nombreCliente.trim(),
      direccionCliente: this.pedidoDTO.direccionCliente.trim(),
      detalles: lineasValidas.map(d => ({
        idProducto: Number(d.idProducto),
        cantidad: Number(d.cantidad)
      }))
    };

    this.guardando.set(true);

    // E. Llamar al servicio
    this.pedidoService.crearPedido(payload).subscribe({
      next: (resp) => {
        this.guardando.set(false);
        this.mensajeExito.set(`Pedido #${resp.id_pedido} creado exitosamente. Pasó a la cola de despacho.`);
        
        // Limpiar formulario tras el éxito
        this.pedidoDTO.nombreCliente = '';
        this.pedidoDTO.direccionCliente = '';
        this.pedidoDTO.detalles = [{ idProducto: 0, nombreProducto: '', cantidad: null as any }];

        this.cargarCatalogoProductos(); // Refresca el stock descontado
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.guardando.set(false);
        const msj = err?.error?.message || err?.error || 'Error al crear el pedido.';
        this.mensajeError.set(`Error: ${msj}`);
        this.cdr.markForCheck();
      }
    });
  }

  // ========================================================
  // 8. CONTROL DE SESIÓN (Modal personalizado)
  // ========================================================
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
