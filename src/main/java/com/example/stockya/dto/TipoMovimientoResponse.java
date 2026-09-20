package com.example.stockya.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TipoMovimientoResponse {
    private Integer id;
    private String nombre;
    private Integer multiplicador;
    private String descripcion;
}
