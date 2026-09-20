package com.example.stockya.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductoResponse {
    private Integer id;
    private String nombre;
    private BigDecimal precioReferencial;
    private Integer stock;
    private Integer stockMinimo;
    private Integer categoriaId;
    private String categoriaNombre;
}
