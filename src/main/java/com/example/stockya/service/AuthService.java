package com.example.stockya.service;

import com.example.stockya.dto.LoginRequest;
import com.example.stockya.dto.LoginResponse;
import com.example.stockya.entity.Usuario;
import com.example.stockya.exception.UnauthorizedException;
import com.example.stockya.repository.UsuarioRepository;
import com.example.stockya.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest req) {
        // Mismo mensaje para email inexistente y contraseña incorrecta
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(req.getEmail())
                .filter(u -> passwordEncoder.matches(req.getPassword(), u.getPassword()))
                .orElseThrow(() -> new UnauthorizedException("Credenciales inválidas"));
        return new LoginResponse(
                jwtService.generate(usuario),
                "Bearer",
                jwtService.getExpiration().toMinutes(),
                usuario.getRol().getNombre());
    }
}
