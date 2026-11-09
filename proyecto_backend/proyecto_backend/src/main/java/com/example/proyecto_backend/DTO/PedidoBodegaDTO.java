package com.example.proyecto_backend.DTO;

import java.math.BigDecimal;
import java.sql.Date;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PedidoBodegaDTO {

    private Long id_pedido;
    private String nombre_cliente;
    private String cedula_cliente;
    private String direccion_cliente;
    private String producto;
    private Integer cantidad;
    private String estado_pedido;
    private BigDecimal total;
    private Date fecha_pedido;
    private String nombre_usuario;
    private String justificacion;
}
