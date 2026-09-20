package com.example.stockya.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovimientoUpdateRequest {

    @Size(max = 100, message = "La referencia externa no puede superar 100 caracteres")
    private String referenciaExterna;

    private String observaciones;
}
