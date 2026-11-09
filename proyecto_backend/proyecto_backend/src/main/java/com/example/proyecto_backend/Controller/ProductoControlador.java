package com.example.proyecto_backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.proyecto_backend.Entity.Producto;
import com.example.proyecto_backend.Service.ProductoService;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;

@RestController
@RequestMapping("/Producto")
@CrossOrigin(origins = "*")
public class ProductoControlador {

    @Autowired
    private ProductoService productoService;

    @GetMapping("/BuscarPorNombre")
    public ResponseEntity<List<Producto>> buscarPorNombre(@RequestParam String nombre) {
        return ResponseEntity.ok(this.productoService.buscarPorNombre(nombre));
    }

    @GetMapping("/BuscarTodos")
    public ResponseEntity<List<Producto>> obtenerTodosLosProductos() {
        return ResponseEntity.ok(this.productoService.obtenerTodosLosProductos());
    }

    @GetMapping("/BuscarPorId/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(this.productoService.buscarPorId(id));
    }

    @PutMapping("/CambiarEstado/{id}")
    public ResponseEntity<Producto> cambiarEstadoProducto(@PathVariable Long id) {
        return ResponseEntity.ok(this.productoService.cambiarEstadoProducto(id));
    }

    @PatchMapping("/EditarProducto/{id}")
    public ResponseEntity<Producto> actualizarProducto(@PathVariable Long id, @RequestBody Producto producto) {
        return ResponseEntity.ok(this.productoService.actualizarProducto(id, producto));
    }

    @PostMapping("/CrearProducto")
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        return ResponseEntity.ok(this.productoService.crearProducto(producto));
    }

    @PatchMapping("/ActualizarStock/{id}")
    public ResponseEntity<Producto> actualizarStock(@PathVariable Long id, @RequestBody Integer nuevoStock) {
        return ResponseEntity.ok(this.productoService.ActuaizarStock(id, nuevoStock));
    }

}
