-- ==============================================================================
-- 1. TABLAS CATÁLOGO
-- ==============================================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE, 
    puede_crear_usuarios BOOLEAN DEFAULT FALSE
);

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE tipos_movimiento (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    multiplicador INT NOT NULL CHECK (multiplicador IN (1, -1)), 
    descripcion TEXT
);

-- ==============================================================================
-- 2. NORMALIZACIÓN DE USUARIOS (El backend usará clases abstractas aquí)
-- ==============================================================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    rol_id INT NOT NULL REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE administradores (
    usuario_id INT PRIMARY KEY REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    departamento VARCHAR(100)
);

CREATE TABLE empleados (
    usuario_id INT PRIMARY KEY REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE,
    turno VARCHAR(50),
    area_almacen VARCHAR(100)
);

-- ==============================================================================
-- 3. PRODUCTOS (Con Stock y Stock Mínimo)
-- ==============================================================================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    categoria_id INT NOT NULL REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    nombre VARCHAR(100) NOT NULL,
    precio_referencial DECIMAL(12,2) NOT NULL CHECK (precio_referencial > 0),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    stock_minimo INT NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0) -- Alerta de reabastecimiento
);

-- ==============================================================================
-- 4. MOVIMIENTOS (Trazabilidad estricta)
-- ==============================================================================
CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    tipo_movimiento_id INT NOT NULL REFERENCES tipos_movimiento(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    responsable_id INT NOT NULL REFERENCES usuarios(id) ON UPDATE CASCADE ON DELETE RESTRICT, -- Obligatorio para trazabilidad
    referencia_externa VARCHAR(100), 
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    observaciones TEXT
);

CREATE TABLE movimiento_detalles (
    id SERIAL PRIMARY KEY,
    movimiento_id INT NOT NULL REFERENCES movimientos(id) ON UPDATE CASCADE ON DELETE CASCADE,
    producto_id INT NOT NULL REFERENCES productos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    costo_unitario DECIMAL(12,2) NOT NULL CHECK (costo_unitario >= 0) 
);

-- ==============================================================================
-- 5. INSERCIONES BASE (Sin ambigüedades)
-- ==============================================================================
INSERT INTO roles (nombre, puede_crear_usuarios) VALUES 
('Administrador', TRUE),
('Almacenero', FALSE);

INSERT INTO tipos_movimiento (nombre, multiplicador, descripcion) VALUES
('Venta', -1, 'Salida por venta a cliente final'),
('Compra a Proveedor', 1, 'Ingreso de mercadería nueva'),
('Merma', -1, 'Pérdida por daño o caducidad'),
('Devolución de Cliente', 1, 'Reingreso de producto al almacén'), -- Entra stock
('Devolución a Proveedor', -1, 'Salida por garantía a fábrica');  -- Sale stock

-- ==============================================================================
-- 6. TRIGGER: SINCRONIZACIÓN AUTOMÁTICA DE STOCK
-- ==============================================================================
-- Objetivo: productos.stock nunca se edita a mano. Se recalcula solo cuando
-- se inserta, actualiza o elimina una línea en movimiento_detalles, usando
-- el multiplicador (+1 / -1) del tipo_movimiento asociado al movimiento padre.

CREATE OR REPLACE FUNCTION fn_actualizar_stock()
RETURNS TRIGGER AS $$
DECLARE
    v_multiplicador INT;
BEGIN
    -- INSERT: aplica el efecto del nuevo detalle
    IF (TG_OP = 'INSERT') THEN
        SELECT tm.multiplicador INTO v_multiplicador
        FROM movimientos m
        JOIN tipos_movimiento tm ON tm.id = m.tipo_movimiento_id
        WHERE m.id = NEW.movimiento_id;

        UPDATE productos
        SET stock = stock + (NEW.cantidad * v_multiplicador)
        WHERE id = NEW.producto_id;

        RETURN NEW;

    -- DELETE: revierte el efecto del detalle eliminado
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT tm.multiplicador INTO v_multiplicador
        FROM movimientos m
        JOIN tipos_movimiento tm ON tm.id = m.tipo_movimiento_id
        WHERE m.id = OLD.movimiento_id;

        UPDATE productos
        SET stock = stock - (OLD.cantidad * v_multiplicador)
        WHERE id = OLD.producto_id;

        RETURN OLD;

    -- UPDATE: revierte el efecto anterior y aplica el nuevo
    -- (cubre cambios de cantidad, de producto, o de movimiento_id)
    ELSIF (TG_OP = 'UPDATE') THEN
        SELECT tm.multiplicador INTO v_multiplicador
        FROM movimientos m
        JOIN tipos_movimiento tm ON tm.id = m.tipo_movimiento_id
        WHERE m.id = OLD.movimiento_id;

        UPDATE productos
        SET stock = stock - (OLD.cantidad * v_multiplicador)
        WHERE id = OLD.producto_id;

        SELECT tm.multiplicador INTO v_multiplicador
        FROM movimientos m
        JOIN tipos_movimiento tm ON tm.id = m.tipo_movimiento_id
        WHERE m.id = NEW.movimiento_id;

        UPDATE productos
        SET stock = stock + (NEW.cantidad * v_multiplicador)
        WHERE id = NEW.producto_id;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_actualizar_stock
AFTER INSERT OR UPDATE OR DELETE ON movimiento_detalles
FOR EACH ROW
EXECUTE FUNCTION fn_actualizar_stock();

-- ==============================================================================
-- 7. VISTA PÚBLICA DE USUARIOS (sin datos sensibles)
-- ==============================================================================
-- Permite que el asistente de IA resuelva "quién registró tal movimiento"
-- sin exponer password ni email.
CREATE VIEW vista_usuarios_publica AS
SELECT id, nombre, rol_id FROM usuarios;

-- ==============================================================================
-- 8. SEGURIDAD (Usuario para el LLM / Text-to-SQL)
-- ==============================================================================
CREATE ROLE usuario_ia WITH LOGIN PASSWORD 'contrasenia_super_segura';

-- Permisos de conexión
GRANT CONNECT ON DATABASE tech_store TO usuario_ia;
GRANT USAGE ON SCHEMA public TO usuario_ia;

-- Permisos de SOLO LECTURA a catálogo
GRANT SELECT ON categorias TO usuario_ia;
GRANT SELECT ON productos TO usuario_ia;
GRANT SELECT ON tipos_movimiento TO usuario_ia;

-- Permisos de SOLO LECTURA a historial de movimientos (rotación, ventas, kardex)
GRANT SELECT ON movimientos TO usuario_ia;
GRANT SELECT ON movimiento_detalles TO usuario_ia;

-- Acceso a usuarios SOLO vía vista (sin password/email)
GRANT SELECT ON vista_usuarios_publica TO usuario_ia;
