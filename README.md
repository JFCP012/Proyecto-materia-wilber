# Sistema de Gestión de Pedidos, Inventario y Ventas

Sistema web integral para el control de inventarios, generación de pedidos de venta y despacho en bodega, con autenticación y control de acceso basado en roles (RBAC).

---

##  Información del Repositorio

* **URL del Repositorio:** [https://github.com/JFCP012/Proyecto-materia-wilber.git](https://github.com/JFCP012/Proyecto-materia-wilber.git)
* **Rama Principal de Trabajo:** `Jaider`

---

##  Arquitectura y Tecnologías

* **Frontend:**
  * Angular 21 (Zoneless, Signals)
  * TypeScript, HTML5, CSS3
  * Angular Router con Guards de Protección por Roles (`authGuard`, `publicGuard`)
  * HttpClient para consumo de API REST
* **Backend:**
  * Java 17+ / Spring Boot 3
  * Spring Data JPA / Hibernate (Generación y mapeo ORM)
  * Transacciones ACID (`@Transactional`) para control concurrente y rollback de inventario
  * Maven
* **Base de Datos:**
  * PostgreSQL 14+ / pgAdmin 4
  * Nombre de la BD: `ProyectoBd`

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
* **Node.js** (versión 18 o superior) y **npm** (v9+)
* **Java Development Kit (JDK)** versión 17 o superior
* **PostgreSQL** y **pgAdmin 4** (ejecutándose en el puerto por defecto `5432`)
* **Git**

---

##  Guía de Instalación y Ejecución

### 1. Configuración de la Base de Datos (PostgreSQL)

1. Abre **pgAdmin 4** y conéctate a tu servidor local PostgreSQL.
2. Crea una nueva base de datos llamada exactamente:
   ```text
   ProyectoBd
   ```
3. Verifica que la contraseña del usuario `postgres` coincida con la definida en el backend (`1234`).
   *(Si utilizas otra contraseña o puerto, puedes ajustarlo en `proyecto_backend/proyecto_backend/src/main/resources/application.properties`).*
4. Abre la herramienta de consultas (**Query Tool**) sobre `ProyectoBd` y ejecuta el script [database_setup.sql](./database_setup.sql):

```sql
-- Creación de tablas base (si no han sido generadas por JPA)
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario BIGSERIAL PRIMARY KEY,
    nombre_usuario VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS producto (
    id_producto BIGSERIAL PRIMARY KEY,
    nombre_producto VARCHAR(255) NOT NULL,
    precio DOUBLE PRECISION NOT NULL,
    stock INTEGER NOT NULL,
    estado_producto BOOLEAN NOT NULL
);

-- Carga de usuarios de prueba
INSERT INTO usuario (id_usuario, nombre_usuario, password, rol)
VALUES 
    (1, 'Administrador', '1234', 'admin'),
    (2, 'Vendedor', '1234', 'vendedor'),
    (3, 'Encargado de Inventario', '1234', 'inventario')
ON CONFLICT (id_usuario) DO UPDATE 
SET nombre_usuario = EXCLUDED.nombre_usuario,
    password = EXCLUDED.password,
    rol = EXCLUDED.rol;

-- Carga de productos para pruebas de pedidos
INSERT INTO producto (id_producto, nombre_producto, precio, stock, estado_producto)
VALUES 
    (1, 'Detergente', 15000, 20, true),
    (2, 'Jabón', 3500, 8, true)
ON CONFLICT (id_producto) DO UPDATE 
SET nombre_producto = EXCLUDED.nombre_producto,
    precio = EXCLUDED.precio,
    stock = EXCLUDED.stock,
    estado_producto = EXCLUDED.estado_producto;

SELECT setval('usuario_id_usuario_seq', (SELECT COALESCE(MAX(id_usuario), 1) FROM usuario));
SELECT setval('producto_id_producto_seq', (SELECT COALESCE(MAX(id_producto), 1) FROM producto));
```

---

### 2. Ejecución del Backend (Spring Boot)

1. Abre una terminal y dirígete al directorio del backend:
   ```bash
   cd proyecto_backend/proyecto_backend
   ```
2. Inicia la aplicación con el Maven Wrapper:
   * **En Windows (PowerShell / CMD):**
     ```powershell
     .\mvnw.cmd spring-boot:run
     ```
   * **En Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```
   *(También puedes abrir la carpeta en IntelliJ IDEA, Eclipse o VS Code y ejecutar `ProyectoBackendApplication.java`).*
3. El servidor backend quedará disponible en:
   ```text
   http://localhost:8080
   ```

---

### 3. Ejecución del Frontend (Angular)

1. Abre otra terminal y dirígete a la carpeta del frontend:
   ```bash
   cd proyecto_frontend
   ```
2. Instala las dependencias del proyecto:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
4. Abre tu navegador web en:
   ```text
   http://localhost:4200
   ```

---

##  Credenciales de Acceso y Roles

El login solicita el **ID numérico de usuario** y su **contraseña**:

| ID | Usuario | Contraseña | Rol | Acceso y Redirección |
| :---: | :--- | :---: | :---: | :--- |
| **`1`** | Administrador | `1234` | `admin` | `/admin` (Acceso completo a todos los módulos: Admin, Productos, Ventas, Pedidos, Inventario) |
| **`2`** | Vendedor | `1234` | `vendedor` | `/vendedor` (Creación de pedidos de clientes y catálogo de productos) |
| **`3`** | Encargado Inventario | `1234` | `inventario` | `/inventario` (Recepción de pedidos confirmados y despacho en bodega) |

---

##  Casos de Prueba (Datos de Prueba)

### Caso 1: Pedido Válido
* **Objetivo:** Con **20 detergentes disponibles**, solicitar **5**; confirmar el pedido y comprobar que las existencias se actualizan **una sola vez**.
* **Condición Inicial en BD:**
  * Producto: `Detergente`
  * Stock inicial: `20`
* **Procedimiento:**
  1. Iniciar sesión con el usuario Vendedor (`ID: 2`, Contraseña: `1234`).
  2. En el formulario de `/vendedor`, ingresar los datos del cliente (Nombre: `Juan Pérez`, Cédula: `1010`, Dirección: `Carrera 15 # 45-12`).
  3. En la tabla de pedido, seleccionar **Detergente** (el sistema muestra `Disponibles: 20`).
  4. Ingresar la cantidad de **`5`**.
  5. Hacer clic en **Crear Pedido**.
* **Resultado Esperado:**
  * Se genera el mensaje de éxito indicando que el pedido fue creado.
  * El stock disponible del Detergente se descuenta inmediatamente de **20 a 15** unidades.
  * Verificación en SQL:
    ```sql
    SELECT id_producto, nombre_producto, stock FROM producto WHERE id_producto = 1;
    -- Retorna stock = 15
    ```

---

### Caso 2: Pedido Inválido
* **Objetivo:** Con **8 jabones disponibles**, solicitar **12**; impedir la confirmación sin modificar las existencias.
* **Condición Inicial en BD:**
  * Producto: `Jabón`
  * Stock inicial: `8`
* **Procedimiento:**
  1. Desde la pantalla de venta (`/vendedor`), ingresar datos del cliente.
  2. Seleccionar el producto **Jabón** (el sistema muestra `Disponibles: 8`).
  3. Ingresar la cantidad de **`12`**.
  4. Intentar confirmar haciendo clic en **Crear Pedido**.
* **Resultado Esperado:**
  * El sistema **bloquea la solicitud** y muestra el mensaje de error:
    `Stock insuficiente para "Jabón". Disponibles: 8`.
  * La transacción no se envía ni se crea pedido en la base de datos.
  * Las existencias en base de datos permanecen exactamente en **8** unidades.
  * Verificación en SQL:
    ```sql
    SELECT id_producto, nombre_producto, stock FROM producto WHERE id_producto = 2;
    -- Retorna stock = 8 (sin cambios)
    ```

---

##  Estructura del Proyecto

```text
Proyecto-materia-wilber/
├── database_setup.sql             # Script SQL DDL y datos de prueba
├── README.md                      # Documentación completa e instrucciones
├── proyecto_backend/              # API REST Spring Boot
│   └── proyecto_backend/
│       ├── pom.xml
│       └── src/main/java/com/example/proyecto_backend/
│           ├── Controller/        # Endpoints REST (Usuario, Producto, Pedido, DetallePedido)
│           ├── Entity/            # Entidades JPA (Usuario, Producto, Pedido, Detalle_pedido)
│           ├── Repository/        # Repositorios Spring Data
│           └── Service/           # Lógica de negocio y transacciones (@Transactional)
└── proyecto_frontend/             # SPA Angular 21
    ├── package.json
    └── src/app/
        ├── Guards/                # authGuard y validación por rol
        ├── Models/                # Interfaces y DTOs de TypeScript
        ├── pages/                 # Componentes: login, admin, vendedor, pedidos, inventario, producto
        └── Service/               # Servicios HTTP hacia el backend
```

