package com.example.proyecto_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.proyecto_backend.Entity.Pedido;
import com.example.proyecto_backend.Entity.Producto;

@Repository

public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {

    @Query("SELECT Pe FROM Pedido Pe WHERE LOWER(Pe.estado_pedido) = LOWER(:estado)")
    List<Pedido> buscarPorEstado(@Param("estado") String estado);
}
