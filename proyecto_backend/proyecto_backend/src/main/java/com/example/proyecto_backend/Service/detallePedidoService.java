package com.example.proyecto_backend.Service;

import java.math.BigDecimal;

import org.apache.catalina.startup.ClassLoaderFactory.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.proyecto_backend.Repository.ProductoRepositorio;
import com.example.proyecto_backend.Repository.detallePedidoRepositorio;
import jakarta.transaction.Transactional;
import com.example.proyecto_backend.Entity.Detalle_pedido;
import com.example.proyecto_backend.Entity.Pedido;
import com.example.proyecto_backend.Entity.Producto;
import com.example.proyecto_backend.DTO.DetallePedidoDTO;

@Service
public class detallePedidoService {

    private final ProductoRepositorio productoRepositorio;
    private final detallePedidoRepositorio detallePedidoRepositorio;

    @Autowired
    public detallePedidoService(detallePedidoRepositorio detallePedidoRepositorio,
            ProductoRepositorio productoRepositorio) {
        this.detallePedidoRepositorio = detallePedidoRepositorio;
        this.productoRepositorio = productoRepositorio;
    }

    @Transactional
    public Detalle_pedido crearDetallePedido(Long idPedido, DetallePedidoDTO detalleDTO) {
        if (detalleDTO.getCantidad() == null || detalleDTO.getCantidad() <= 0) {
            throw new RuntimeException("La cantidad del pedido debe ser un número entero mayor a cero.");
        }

        // 1. Buscamos el producto en la BD para saber su precio real
        Producto producto = productoRepositorio.findById(detalleDTO.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (producto.getPrecio() == null || producto.getPrecio() < 0) {
            throw new RuntimeException("El precio del producto no puede ser negativo.");
        }

        if (producto.getEstado_producto() != null && !producto.getEstado_producto()) {
            throw new RuntimeException("El producto '" + producto.getNombre_producto() + "' se encuentra inactivo.");
        }

        // 2. Asociamos el pedido usando su ID
        Pedido pedido = new Pedido();
        pedido.setId_pedido(idPedido);
        // 3. Calculamos el total (precio * cantidad)
        BigDecimal total = BigDecimal.valueOf(producto.getPrecio())
                .multiply(BigDecimal.valueOf(detalleDTO.getCantidad()));
        if (producto.getStock() < detalleDTO.getCantidad()) {
            throw new RuntimeException("Stock insuficiente para: " + producto.getNombre_producto()
                    + ". Stock actual: " + producto.getStock());
        }
        producto.setStock(producto.getStock() - detalleDTO.getCantidad());
        productoRepositorio.save(producto);
        // 4. AHORA SÍ RELLENAMOS EL DETALLE:
        Detalle_pedido detalle = new Detalle_pedido();
        detalle.setPedido(pedido); // 1. Le asignas el pedido
        detalle.setProducto(producto); // 2. Le asignas el producto
        detalle.setCantidad(detalleDTO.getCantidad()); // 3. Le asignas la cantidad
        detalle.setTotal(total); // 4. Le asignas el total calculado
        // 5. Lo guardamos en la base de datos
        return detallePedidoRepositorio.save(detalle);
    }

    @Transactional
    public void restituirStockPorPedido(Long idPedido) {
        List<Detalle_pedido> detalles = this.detallePedidoRepositorio.buscarPorIdPedido(idPedido);
        if (detalles != null) {
            for (Detalle_pedido det : detalles) {
                Producto prod = det.getProducto();
                if (prod != null) {
                    int cant = (det.getCantidad() != null && det.getCantidad() > 0) ? det.getCantidad() : 0;
                    prod.setStock((prod.getStock() != null ? prod.getStock() : 0) + cant);
                    this.productoRepositorio.save(prod);
                }
            }
        }
    }

}
