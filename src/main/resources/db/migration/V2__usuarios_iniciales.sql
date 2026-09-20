-- ==============================================================================
-- USUARIOS INICIALES (SOLO PARA DESARROLLO)
-- Contraseñas guardadas con BCrypt. Cambiarlas o eliminarlas antes de producción.
--   admin@stockya.com    / Admin123!
--   almacen@stockya.com  / Almacen123!
-- ==============================================================================

INSERT INTO usuarios (rol_id, nombre, email, password) VALUES
((SELECT id FROM roles WHERE nombre = 'Administrador'), 'Administrador General', 'admin@stockya.com',
 '$2a$10$rkDQ6SjM1ntCYJgafQFkv.XMavbrhWcnZuc7d/.E/jCwyPF7r9RB.'),
((SELECT id FROM roles WHERE nombre = 'Almacenero'), 'Almacenero de Prueba', 'almacen@stockya.com',
 '$2a$10$8qQNWA6uWU5EpUgagDrjYugqvUmMYYBGqGdtYIPJf.OfLC21Gy.Da');

INSERT INTO administradores (usuario_id, departamento)
SELECT id, 'Administración' FROM usuarios WHERE email = 'admin@stockya.com';

INSERT INTO empleados (usuario_id, turno, area_almacen)
SELECT id, 'Mañana', 'Almacén principal' FROM usuarios WHERE email = 'almacen@stockya.com';
