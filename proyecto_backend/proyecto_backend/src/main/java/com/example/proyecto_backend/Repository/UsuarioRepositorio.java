package com.example.proyecto_backend.Repository;

import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.proyecto_backend.Entity.Pedido;
import com.example.proyecto_backend.Entity.Producto;
import com.example.proyecto_backend.Entity.Usuario;
import com.example.proyecto_backend.Service.UsuarioService;

@Repository
public interface UsuarioRepositorio extends JpaRepository<Usuario, Long> {

    @Query("SELECT u FROM Usuario u WHERE u.id_usuario = :id AND u.password = :password ")
    Usuario login(@Param("id") Long id, @Param("password") String password);

}
