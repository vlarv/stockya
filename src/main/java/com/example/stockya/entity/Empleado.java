package com.example.stockya.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "empleados")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
public class Empleado extends Usuario {

    @Column(length = 50)
    private String turno;

    @Column(name = "area_almacen", length = 100)
    private String areaAlmacen;
}
