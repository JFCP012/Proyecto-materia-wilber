package com.example.proyecto_backend.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.sql.Date;

@Entity
@Table(name = "pedido")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pedido", nullable = false, unique = true)
    private Long id_pedido;

    @Column(name = "estado_pedido", nullable = false)
    private String estado_pedido;

    @Column(name = "fecha_pedido", nullable = false)
    private Date fecha_pedido;

    @Column(name = "nombre_cliente", nullable = false)
    private String nombre_cliente;

    @Column(name = "cedula_cliente")
    private String cedula_cliente;

    @Column(name = "direccion_cliente", nullable = false)
    private String direccion_cliente;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "id_usuario")
    private Usuario usuario;

}
