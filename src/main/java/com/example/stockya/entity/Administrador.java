package com.example.stockya.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "administradores")
@PrimaryKeyJoinColumn(name = "usuario_id")
@Getter
@Setter
public class Administrador extends Usuario {

    @Column(length = 100)
    private String departamento;
}
