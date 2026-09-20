package com.example.stockya.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UsuarioResponse {
    private Integer id;
    private String nombre;
    private String email;
    private Integer rolId;
    private String rolNombre;
    private LocalDateTime fechaRegistro;
    private String departamento;
    private String turno;
    private String areaAlmacen;
}
