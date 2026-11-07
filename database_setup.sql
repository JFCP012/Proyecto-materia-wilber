-- ==========================================================
-- SCRIPT DE BASE DE DATOS: ProyectoBd
-- Sistema de Gestión de Pedidos e Inventario
-- ==========================================================

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(255) NOT NULL
);

-- 2. Tabla de Productos
CREATE TABLE IF NOT EXISTS producto (
    id_producto BIGSERIAL PRIMARY KEY,
    nombre_producto VARCHAR(255) NOT NULL,
    precio DOUBLE PRECISION NOT NULL,
    stock INTEGER NOT NULL,
    estado_producto BOOLEAN NOT NULL
);

-- ==========================================================
-- DATOS INICIALES Y CASOS DE PRUEBA
-- ==========================================================

-- Usuarios por rol (Credenciales para el Login)
INSERT INTO usuario (id_usuario, nombre_usuario, password, rol)
VALUES 
    (1, 'Administrador', '1234', 'admin'),
    (2, 'Vendedor', '1234', 'vendedor'),
    (3, 'Encargado de Inventario', '1234', 'inventario')
ON CONFLICT (id_usuario) DO UPDATE 
SET nombre_usuario = EXCLUDED.nombre_usuario,
    password = EXCLUDED.password,
    rol = EXCLUDED.rol;

-- Productos para las pruebas:
-- * Detergente: 20 unidades iniciales (Para prueba de Pedido Válido solicitando 5)
-- * Jabón: 8 unidades iniciales (Para prueba de Pedido Inválido solicitando 12)
INSERT INTO producto (id_producto, nombre_producto, precio, stock, estado_producto)
VALUES 
    (1, 'Detergente', 15000, 20, true),
    (2, 'Jabón', 3500, 8, true)
ON CONFLICT (id_producto) DO UPDATE 
SET nombre_producto = EXCLUDED.nombre_producto,
    precio = EXCLUDED.precio,
    stock = EXCLUDED.stock,
    estado_producto = EXCLUDED.estado_producto;

-- Sincronizar secuencias
SELECT setval('usuario_id_usuario_seq', (SELECT COALESCE(MAX(id_usuario), 1) FROM usuario));
SELECT setval('producto_id_producto_seq', (SELECT COALESCE(MAX(id_producto), 1) FROM producto));

