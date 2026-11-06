package com.example.proyecto_backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.proyecto_backend.Service.detallePedidoService;

@RestController
@RequestMapping("/DetallePedido")
@CrossOrigin(origins = "*")

public class detallePedido_Controlador {

    @Autowired
    private detallePedidoService detallePedidoService;

}
