package com.example.proyecto_backend.Service;

import com.example.proyecto_backend.Service.UsuarioService;
import java.time.LocalDate;
import java.util.List;
import java.sql.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.proyecto_backend.DTO.DetallePedidoDTO;
import com.example.proyecto_backend.DTO.PedidoBodegaDTO;
import com.example.proyecto_backend.DTO.PedidoDTO;
import com.example.proyecto_backend.Entity.Pedido;
import com.example.proyecto_backend.Entity.Usuario;
import com.example.proyecto_backend.Repository.PedidoRepositorio;
import jakarta.transaction.Transactional;

@Service
public class PedidoService {

    private final detallePedidoService detallePedidoService;
    private final PedidoRepositorio pedidoRepositorio;
    private final UsuarioService usuarioService;

    @Autowired
    public PedidoService(PedidoRepositorio pedidoRepositorio, detallePedidoService detallePedidoService,
            UsuarioService usuarioService) {
        this.pedidoRepositorio = pedidoRepositorio;
        this.detallePedidoService = detallePedidoService;
        this.usuarioService = usuarioService;
    }

    @Transactional
    public Pedido crearPedido(PedidoDTO pedidoDTO) {
        if (pedidoDTO.getNombreCliente() == null || pedidoDTO.getNombreCliente().trim().isEmpty()) {
            throw new RuntimeException("El nombre del cliente es obligatorio.");
        }
        if (pedidoDTO.getDireccionCliente() == null || pedidoDTO.getDireccionCliente().trim().isEmpty()) {
            throw new RuntimeException("La dirección del cliente es obligatoria.");
        }
        if (pedidoDTO.getDetalles() == null || pedidoDTO.getDetalles().isEmpty()) {
            throw new RuntimeException("El pedido debe contener al menos un producto.");
        }

        // 1. Armamos la entidad Pedido (cabecera)
        Pedido pedido = new Pedido();
        pedido.setFecha_pedido(Date.valueOf(LocalDate.now()));
        pedido.setEstado_pedido("Confirmado");
        Usuario usuario = new Usuario();
        usuario = this.usuarioService.buscarPorId(pedidoDTO.getIdUsuario());
        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + pedidoDTO.getIdUsuario());
        }
        boolean esRolValido = "Vendedor".equalsIgnoreCase(usuario.getRol())
                || "Admin".equalsIgnoreCase(usuario.getRol());
        if (!esRolValido) {
            throw new RuntimeException("Acceso denegado: Solo los vendedores o administradores pueden crear pedidos.");
        }
        pedido.setUsuario(usuario);
        pedido.setNombre_cliente(pedidoDTO.getNombreCliente());
        pedido.setCedula_cliente(pedidoDTO.getCedulaCliente());
        pedido.setDireccion_cliente(pedidoDTO.getDireccionCliente());
        // 2. Guardamos el pedido en la base de datos (aquí se genera el ID)
        Pedido pedidoGuardado = this.pedidoRepositorio.save(pedido);
        // 3. Recorremos los productos y llamamos a tu detallePedidoService
        for (DetallePedidoDTO detDto : pedidoDTO.getDetalles()) {
            this.detallePedidoService.crearDetallePedido(pedidoGuardado.getId_pedido(), detDto);
        }
        return pedidoGuardado;
    }

    public Pedido buscarPorID(Long id_pedido) {
        return this.pedidoRepositorio.findById(id_pedido).orElse(null);
    }

    @Transactional
    public Pedido cambiarEstadoPedido(Long id_pedido, String nuevoEstado, String justificacion) {
        Pedido pedido = this.buscarPorID(id_pedido);
        if (pedido == null) {
            throw new RuntimeException("Pedido no encontrado con ID: " + id_pedido);
        }
        if (!"Confirmado".equalsIgnoreCase(pedido.getEstado_pedido())) {
            throw new RuntimeException("No se puede cambiar el estado: el pedido actualmente está '"
                    + pedido.getEstado_pedido() + "' (solo se pueden cambiar pedidos 'Confirmado').");
        }
        boolean esEstadoValido = "Despachado".equalsIgnoreCase(nuevoEstado)
                || "Cancelado".equalsIgnoreCase(nuevoEstado);
        if (!esEstadoValido) {
            throw new RuntimeException("Estado inválido. Bodega solo puede cambiar a 'Despachado' o 'Cancelado'.");
        }
        if ("Cancelado".equalsIgnoreCase(nuevoEstado)) {
            if (justificacion == null || justificacion.trim().isEmpty()) {
                throw new RuntimeException("Debe ingresar una justificación para cancelar el pedido.");
            }
            pedido.setJustificacion(justificacion.trim());
            // Restituir existencias al inventario según RF-05
            this.detallePedidoService.restituirStockPorPedido(id_pedido);
        } else {
            pedido.setJustificacion(null); // Despachado no lleva justificación
        }
        pedido.setEstado_pedido(nuevoEstado);
        return this.pedidoRepositorio.save(pedido);
    }

    public List<PedidoBodegaDTO> filtrarPedidos(String estado, Date fecha, Integer anio, Integer mes) {
        String est = (estado == null || estado.trim().isEmpty()) ? "Todos" : estado;
        // Caso 1: Si enviaron un DÍA específico
        if (fecha != null) {
            return this.pedidoRepositorio.buscarPorDia(est, fecha);
        }
        // Caso 2: Si enviaron MES y AÑO
        if (mes != null && anio != null) {
            return this.pedidoRepositorio.buscarPorMes(est, anio, mes);
        }
        // Caso 3: Sin filtro de fecha (histórico completo)
        return this.pedidoRepositorio.buscarSinFecha(est);
    }

    public List<PedidoBodegaDTO> filtrarPorNombre(String nombre, String cedula) {
        String nombreStr = (nombre != null && !nombre.trim().isEmpty())
                ? nombre.trim()
                : null;
        String cedulaStr = (cedula != null && !cedula.trim().isEmpty())
                ? cedula.trim()
                : null;

        if (nombreStr == null && cedulaStr == null) {
            return this.pedidoRepositorio.buscarSinFecha("Todos");
        }

        return this.pedidoRepositorio.buscarPorNombreOCedula(nombreStr, cedulaStr);
    }

}
