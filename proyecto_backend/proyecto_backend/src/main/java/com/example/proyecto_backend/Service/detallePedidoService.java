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
        // 1. Buscamos el producto en la BD para saber su precio real
        Producto producto = productoRepositorio.findById(detalleDTO.getIdProducto())
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
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

}
