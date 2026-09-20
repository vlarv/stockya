package com.example.stockya.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Getter
@Setter
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tipo_movimiento_id", nullable = false)
    private TipoMovimiento tipoMovimiento;

    @ManyToOne(optional = false)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Usuario responsable;

    @Column(name = "referencia_externa", length = 100)
    private String referenciaExterna;

    @Column(insertable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(columnDefinition = "TEXT")
    private String observaciones;
}
