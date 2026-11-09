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
                producto.setNombre_producto(datosNuevos.getNombre_producto());
            }
            if (datosNuevos.getPrecio() != null) {
                producto.setPrecio(datosNuevos.getPrecio());
            }
            if (datosNuevos.getStock() != null) {
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
        return productoRepositorio.save(producto);
    }

    public Producto ActuaizarStock(Long id, Integer nuevoStock) {
        Producto producto = productoRepositorio.findById(id).orElse(null);
        producto.setStock(nuevoStock);
        return productoRepositorio.save(producto);
    }

}
