package com.example.stockya.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class MovimientoResponse {
    private Integer id;
    private Integer tipoMovimientoId;
    private String tipoMovimientoNombre;
    private Integer responsableId;
    private String responsableNombre;
    private String referenciaExterna;
    private LocalDateTime fecha;
    private String observaciones;
    private List<DetalleResponse> detalles;
}
