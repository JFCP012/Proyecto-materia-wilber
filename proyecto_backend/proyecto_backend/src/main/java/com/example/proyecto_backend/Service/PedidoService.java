package com.example.proyecto_backend.Service;

import com.example.proyecto_backend.Repository.detallePedidoRepositorio;
import com.example.proyecto_backend.Service.UsuarioService;
import java.time.LocalDate;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.proyecto_backend.DTO.DetallePedidoDTO;
import com.example.proyecto_backend.DTO.PedidoDTO;
import com.example.proyecto_backend.Entity.Pedido;
import com.example.proyecto_backend.Entity.Usuario;
import com.example.proyecto_backend.Repository.PedidoRepositorio;
import com.example.proyecto_backend.Repository.UsuarioRepositorio;
import java.util.List;
import jakarta.transaction.Transactional;
import java.sql.Date;;

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
        // 1. Armamos la entidad Pedido (cabecera)
        Pedido pedido = new Pedido();
        pedido.setFecha_pedido(Date.valueOf(LocalDate.now()));
        pedido.setEstado_pedido("Confirmado");
        Usuario usuario = new Usuario();
        usuario = this.usuarioService.buscarPorId(pedidoDTO.getIdUsuario());
        // Verificamos que exista
        if (usuario == null) {
            throw new RuntimeException("Usuario no encontrado con ID: " + pedidoDTO.getIdUsuario());
        }
        if (!"Vendedor".equalsIgnoreCase(usuario.getRol())) {
            throw new RuntimeException("Acceso denegado: Solo los vendedores pueden crear pedidos.");
        }
        pedido.setUsuario(usuario);
        pedido.setNombre_cliente(pedidoDTO.getNombreCliente());
        pedido.setDireccion_cliente(pedidoDTO.getDireccionCliente());
        // 2. Guardamos el pedido en la base de datos (aquí se genera el ID)
        Pedido pedidoGuardado = this.pedidoRepositorio.save(pedido);
        // 3. Recorremos los productos y llamamos a tu detallePedidoService
        for (DetallePedidoDTO detDto : pedidoDTO.getDetalles()) {
            this.detallePedidoService.crearDetallePedido(pedidoGuardado.getId_pedido(), detDto);
        }
        // 4. RETORNAMOS EL RESULTADO (esto es lo que quita el error rojo)
        return pedidoGuardado;
    }

    public Pedido buscarPorID(Long id_pedido) {
        return this.pedidoRepositorio.findById(id_pedido).orElse(null);

    }

    public Pedido cambiarEstadoPedido(Long id_pedido, String nuevoEstado) {
        Pedido pedido = this.buscarPorID(id_pedido);
        if (pedido == null) {
            throw new RuntimeException("Pedido no encontrado con ID: " + id_pedido);
        }
        if (!"Confirmado".equalsIgnoreCase(pedido.getEstado_pedido())) {
            throw new RuntimeException("No se puede cambiar el estado: el pedido actualmente está '"
                    + pedido.getEstado_pedido() + "' (solo se pueden cambiar pedidos 'Confirmado').");
        }
        // 4. Validamos que el nuevo estado sea válido para bodega
        boolean esEstadoValido = "Despachado".equalsIgnoreCase(nuevoEstado)
                || "Cancelado".equalsIgnoreCase(nuevoEstado);
        if (!esEstadoValido) {
            throw new RuntimeException("Estado inválido. Bodega solo puede cambiar a 'Despachado' o 'Cancelado'.");
        }
        pedido.setEstado_pedido(nuevoEstado);
        return this.pedidoRepositorio.save(pedido);
    }

    public List<Pedido> buscarPorEstado(String estado) {
        return this.pedidoRepositorio.buscarPorEstado(estado);
    }
}
