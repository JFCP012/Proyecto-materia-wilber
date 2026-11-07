package com.example.proyecto_backend.DTO;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class PedidoDTO {

    private Long idUsuario;
    private String nombreCliente;
    private String cedulaCliente;
    private String direccionCliente;
    private List<DetallePedidoDTO> detalles;
}
