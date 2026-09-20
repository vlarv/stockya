package com.example.stockya.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MovimientoRequest {

    @NotNull(message = "El tipo de movimiento es obligatorio")
    private Integer tipoMovimientoId;

    // Temporal: cuando exista el login se tomará del usuario autenticado
    @NotNull(message = "El responsable es obligatorio")
    private Integer responsableId;

    @Size(max = 100, message = "La referencia externa no puede superar 100 caracteres")
    private String referenciaExterna;

    private String observaciones;

    @NotEmpty(message = "El movimiento debe tener al menos un detalle")
    @Valid
    private List<DetalleRequest> detalles;
}
