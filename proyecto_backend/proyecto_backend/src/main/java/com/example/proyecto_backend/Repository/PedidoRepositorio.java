package com.example.proyecto_backend.Repository;

import java.sql.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.proyecto_backend.Entity.Pedido;
import com.example.proyecto_backend.DTO.PedidoBodegaDTO;

@Repository
public interface PedidoRepositorio extends JpaRepository<Pedido, Long> {

        // 1. Filtrar por estado y día exacto
        @Query("SELECT new com.example.proyecto_backend.DTO.PedidoBodegaDTO(" +
                        "p.id_pedido, p.nombre_cliente, p.cedula_cliente, p.direccion_cliente, " +
                        "d.producto.nombre_producto, d.cantidad, p.estado_pedido, " +
                        "d.total, p.fecha_pedido, u.nombre_usuario) " +
                        "FROM Detalle_pedido d JOIN d.pedido p JOIN p.usuario u " +
                        "WHERE (:estado = 'Todos' OR LOWER(p.estado_pedido) = LOWER(:estado)) " +
                        "AND p.fecha_pedido = :fecha")
        List<PedidoBodegaDTO> buscarPorDia(@Param("estado") String estado, @Param("fecha") Date fecha);

        // 2. Filtrar por estado y mes/año
        @Query("SELECT new com.example.proyecto_backend.DTO.PedidoBodegaDTO(" +
                        "p.id_pedido, p.nombre_cliente, p.cedula_cliente, p.direccion_cliente, " +
                        "d.producto.nombre_producto, d.cantidad, p.estado_pedido, " +
                        "d.total, p.fecha_pedido, u.nombre_usuario) " +
                        "FROM Detalle_pedido d JOIN d.pedido p JOIN p.usuario u " +
                        "WHERE (:estado = 'Todos' OR LOWER(p.estado_pedido) = LOWER(:estado)) " +
                        "AND YEAR(p.fecha_pedido) = :anio AND MONTH(p.fecha_pedido) = :mes")
        List<PedidoBodegaDTO> buscarPorMes(@Param("estado") String estado, @Param("anio") int anio,
                        @Param("mes") int mes);

        // 3. Filtrar solo por estado (sin fecha)
        @Query("SELECT new com.example.proyecto_backend.DTO.PedidoBodegaDTO(" +
                        "p.id_pedido, p.nombre_cliente, p.cedula_cliente, p.direccion_cliente, " +
                        "d.producto.nombre_producto, d.cantidad, p.estado_pedido, " +
                        "d.total, p.fecha_pedido, u.nombre_usuario) " +
                        "FROM Detalle_pedido d JOIN d.pedido p JOIN p.usuario u " +
                        "WHERE (:estado = 'Todos' OR LOWER(p.estado_pedido) = LOWER(:estado))")
        List<PedidoBodegaDTO> buscarSinFecha(@Param("estado") String estado);

        @Query("SELECT new com.example.proyecto_backend.DTO.PedidoBodegaDTO(" +
                        "p.id_pedido, p.nombre_cliente, p.cedula_cliente, p.direccion_cliente, " +
                        "d.producto.nombre_producto, d.cantidad, p.estado_pedido, " +
                        "d.total, p.fecha_pedido, u.nombre_usuario) " +
                        "FROM Detalle_pedido d JOIN d.pedido p JOIN p.usuario u " +
                        "WHERE (:nombre IS NOT NULL AND LOWER(TRIM(p.nombre_cliente)) LIKE LOWER(CONCAT('%', :nombre, '%'))) " +
                        "OR (:cedula IS NOT NULL AND TRIM(p.cedula_cliente) = :cedula)")
        List<PedidoBodegaDTO> buscarPorNombre(@Param("nombre") String nombre, @Param("cedula") String cedula);

}
