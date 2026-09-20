package com.example.stockya.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UsuarioRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar 100 caracteres")
    private String nombre;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Size(max = 100, message = "El email no puede superar 100 caracteres")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, max = 72, message = "La contraseña debe tener entre 8 y 72 caracteres")
    private String password;

    @NotNull(message = "El rol es obligatorio")
    private Integer rolId;

    // Solo para el rol Administrador
    @Size(max = 100, message = "El departamento no puede superar 100 caracteres")
    private String departamento;

    // Solo para el rol Almacenero
    @Size(max = 50, message = "El turno no puede superar 50 caracteres")
    private String turno;

    @Size(max = 100, message = "El área de almacén no puede superar 100 caracteres")
    private String areaAlmacen;
}
