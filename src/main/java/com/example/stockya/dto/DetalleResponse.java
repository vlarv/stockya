package com.example.stockya.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class DetalleResponse {
    private Integer id;
    private Integer productoId;
    private String productoNombre;
    private Integer cantidad;
    private BigDecimal costoUnitario;
}
