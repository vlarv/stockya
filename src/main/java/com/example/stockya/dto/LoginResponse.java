package com.example.stockya.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String tipo;
    private long expiraEnMinutos;
    private String rol;
}
