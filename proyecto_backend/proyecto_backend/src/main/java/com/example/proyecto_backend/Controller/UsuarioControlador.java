package com.example.proyecto_backend.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.example.proyecto_backend.Entity.Producto;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import com.example.proyecto_backend.Service.UsuarioService;
import com.example.proyecto_backend.Entity.Usuario;

@RestController
@RequestMapping("/Usuario")
@CrossOrigin(origins = "*")

public class UsuarioControlador {

    @Autowired
    private UsuarioService usuarioService;

    @GetMapping("/BuscarPorId{id_usuario}")
    public ResponseEntity<Usuario> buscarPorId(@PathVariable Long id_usuario) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id_usuario));
    }

    @GetMapping("/login")
    public ResponseEntity<Usuario> login(@RequestParam Long id_usuario, String password) {
        return ResponseEntity.ok(usuarioService.Login(id_usuario, password));
    }

}
