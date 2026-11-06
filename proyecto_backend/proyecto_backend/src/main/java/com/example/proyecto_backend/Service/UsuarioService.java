package com.example.proyecto_backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.proyecto_backend.Entity.Usuario;
import com.example.proyecto_backend.Repository.UsuarioRepositorio;
import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepositorio usuarioRepositorio;

    @Autowired
    public UsuarioService(UsuarioRepositorio usuarioRepositorio) {
        this.usuarioRepositorio = usuarioRepositorio;
    }

    public Usuario buscarPorId(Long id_usuario) {
        return usuarioRepositorio.findById(id_usuario).orElse(null);

    }

    public Usuario Login(Long id_usuario, String password) {
        return usuarioRepositorio.login(id_usuario, password);
    }
}
