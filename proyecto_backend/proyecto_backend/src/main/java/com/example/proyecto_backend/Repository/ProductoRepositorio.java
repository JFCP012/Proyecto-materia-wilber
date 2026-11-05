package com.example.proyecto_backend.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.proyecto_backend.Entity.Producto;

public interface ProductoRepositorio extends JpaRepository<Producto, Long> {

    @Query("SELECT p FROM Producto p WHERE LOWER(p.nombre_producto) LIKE LOWER(CONCAT('%', :nombre, '%'))")
    List<Producto> buscarPorNombre(@Param("nombre") String nombre);

}
