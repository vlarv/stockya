package com.example.stockya.security;

/**
 * Datos del usuario autenticado, leídos del token JWT.
 */
public record AuthUser(Integer id, String email, String rol) {

    public static final String ADMINISTRADOR = "ADMINISTRADOR";
    public static final String ALMACENERO = "ALMACENERO";

    public boolean isAdministrador() {
        return ADMINISTRADOR.equals(rol);
    }
}
