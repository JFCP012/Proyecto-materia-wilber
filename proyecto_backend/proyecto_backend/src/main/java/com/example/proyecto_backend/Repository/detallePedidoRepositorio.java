package com.example.proyecto_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.example.proyecto_backend.Entity.Detalle_pedido;

@Repository

public interface detallePedidoRepositorio extends JpaRepository<Detalle_pedido, Long> {

}
