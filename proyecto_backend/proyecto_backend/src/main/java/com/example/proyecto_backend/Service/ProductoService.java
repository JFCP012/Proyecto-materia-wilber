package com.example.proyecto_backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.proyecto_backend.Entity.Producto;
import com.example.proyecto_backend.Repository.ProductoRepositorio;

@Service
public class ProductoService {

    private final ProductoRepositorio productoRepositorio;

    @Autowired
    public ProductoService(ProductoRepositorio productoRepositorio) {
        this.productoRepositorio = productoRepositorio;
    }

    public List<Producto> obtenerTodosLosProductos() {
        return productoRepositorio.findAll();
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepositorio.buscarPorNombre(nombre);
    }

    public Producto buscarPorId(Long id) {
        return productoRepositorio.findById(id).orElse(null);
    }

    public Producto cambiarEstadoProducto(Long id) {
        Producto producto = productoRepositorio.findById(id).orElse(null);
        if (producto != null) {
            if (producto.getEstado_producto().equals(true)) {
                producto.setEstado_producto(false);
            }
            return productoRepositorio.save(producto);
        }
        return null;
    }

    public Producto actualizarProducto(Long id, Producto datosNuevos) {
        Producto producto = productoRepositorio.findById(id).orElse(null);
        if (producto != null) {
            if (datosNuevos.getNombre_producto() != null) {
                if (datosNuevos.getNombre_producto().trim().isEmpty()) {
                    throw new RuntimeException("El nombre del producto no puede estar vacío.");
                }
                producto.setNombre_producto(datosNuevos.getNombre_producto().trim());
            }
            if (datosNuevos.getPrecio() != null) {
                if (datosNuevos.getPrecio() < 0) {
                    throw new RuntimeException("El precio del producto no puede ser negativo.");
                }
                producto.setPrecio(datosNuevos.getPrecio());
            }
            if (datosNuevos.getStock() != null) {
                if (datosNuevos.getStock() < 0) {
                    throw new RuntimeException("El stock del producto no puede ser negativo.");
                }
                producto.setStock(datosNuevos.getStock());
            }
            if (datosNuevos.getEstado_producto() != null) {
                producto.setEstado_producto(datosNuevos.getEstado_producto());
            }
            return productoRepositorio.save(producto);
        }
        return null;
    }

    public Producto crearProducto(Producto producto) {
        if (producto.getNombre_producto() == null || producto.getNombre_producto().trim().isEmpty()) {
            throw new RuntimeException("El nombre del producto es obligatorio.");
        }
        if (producto.getPrecio() == null || producto.getPrecio() < 0) {
            throw new RuntimeException("El precio del producto no puede ser negativo.");
        }
        if (producto.getStock() == null || producto.getStock() < 0) {
            throw new RuntimeException("El stock del producto no puede ser negativo.");
        }
        if (producto.getEstado_producto() == null) {
            producto.setEstado_producto(true);
        }
        return productoRepositorio.save(producto);
    }

    public Producto ActuaizarStock(Long id, Integer nuevoStock) {
        if (nuevoStock == null || nuevoStock < 0) {
            throw new RuntimeException("El stock no puede ser negativo.");
        }
        Producto producto = productoRepositorio.findById(id).orElse(null);
        if (producto == null) {
            throw new RuntimeException("Producto no encontrado con ID: " + id);
        }
        producto.setStock(nuevoStock);
        return productoRepositorio.save(producto);
    }

}
