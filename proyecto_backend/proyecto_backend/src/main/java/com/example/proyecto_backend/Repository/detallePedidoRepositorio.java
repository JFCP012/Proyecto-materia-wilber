package com.example.proyecto_backend.Repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.proyecto_backend.Entity.Detalle_pedido;

@Repository
public interface detallePedidoRepositorio extends JpaRepository<Detalle_pedido, Long> {

    @Query("SELECT d FROM Detalle_pedido d WHERE d.pedido.id_pedido = :idPedido")
    List<Detalle_pedido> buscarPorIdPedido(@Param("idPedido") Long idPedido);

}
