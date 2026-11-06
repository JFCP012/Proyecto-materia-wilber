package com.example.proyecto_backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import com.example.proyecto_backend.DTO.PedidoDTO;
import com.example.proyecto_backend.Service.PedidoService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.example.proyecto_backend.Entity.Pedido;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@RestController
@RequestMapping("/Pedido")
@CrossOrigin(origins = "*")

public class PedidoControlador {

    @Autowired
    private PedidoService PedidoService;

    @PostMapping("/CrearPedido")
    public ResponseEntity<Pedido> crearPedido(@RequestBody PedidoDTO pedido) {
        return ResponseEntity.ok(this.PedidoService.crearPedido(pedido));
    }

    @GetMapping("/BuscarPedidoId")
    public ResponseEntity<Pedido> buscarPedidoId(@RequestParam Long id_pedido) {
        return ResponseEntity.ok(this.PedidoService.buscarPorID(id_pedido));
    }

    @PutMapping("CambiarEstadoPedido/{id}")
    public ResponseEntity<Pedido> cambiarEstadoPedido(@PathVariable Long id, @RequestParam String nuevoEstado) {
        return ResponseEntity.ok(this.PedidoService.cambiarEstadoPedido(id, nuevoEstado));
    }

    @GetMapping("BuscarPedidoEstado")
    public ResponseEntity<List<Pedido>> buscarPorEstado(@RequestParam String estado) {
        return ResponseEntity.ok(this.PedidoService.buscarPorEstado(estado));
    }

}
