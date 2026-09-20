package com.example.stockya.service;

import com.example.stockya.dto.UsuarioRequest;
import com.example.stockya.dto.UsuarioResponse;
import com.example.stockya.dto.UsuarioUpdateRequest;
import com.example.stockya.entity.Administrador;
import com.example.stockya.entity.Empleado;
import com.example.stockya.entity.Rol;
import com.example.stockya.entity.Usuario;
import com.example.stockya.exception.ConflictException;
import com.example.stockya.exception.ForbiddenException;
import com.example.stockya.exception.NotFoundException;
import com.example.stockya.mapper.UsuarioMapper;
import com.example.stockya.repository.RolRepository;
import com.example.stockya.repository.UsuarioRepository;
import com.example.stockya.security.AuthUser;
import com.example.stockya.security.CurrentUser;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioMapper mapper;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> findAll() {
        return usuarioRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse getById(Integer id) {
        return toResponse(find(id));
    }

    public UsuarioResponse create(UsuarioRequest req) {
        // Regla de negocio: solo puede crear usuarios quien tenga un rol con ese permiso
        Usuario actual = find(CurrentUser.get().id());
        if (!Boolean.TRUE.equals(actual.getRol().getPuedeCrearUsuarios())) {
            throw new ForbiddenException("Tu rol no tiene permiso para crear usuarios");
        }
        if (usuarioRepository.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ConflictException("Ya existe un usuario con ese email");
        }
        Rol rol = rolRepository.findById(req.getRolId())
                .orElseThrow(() -> new NotFoundException("Rol " + req.getRolId() + " no encontrado"));

        Usuario usuario;
        if (AuthUser.ADMINISTRADOR.equalsIgnoreCase(rol.getNombre())) {
            Administrador admin = new Administrador();
            admin.setDepartamento(req.getDepartamento());
            usuario = admin;
        } else if (AuthUser.ALMACENERO.equalsIgnoreCase(rol.getNombre())) {
            Empleado empleado = new Empleado();
            empleado.setTurno(req.getTurno());
            empleado.setAreaAlmacen(req.getAreaAlmacen());
            usuario = empleado;
        } else {
            throw new ConflictException("El rol '" + rol.getNombre() + "' no tiene un tipo de usuario asociado");
        }
        usuario.setNombre(req.getNombre());
        usuario.setEmail(req.getEmail());
        usuario.setPassword(passwordEncoder.encode(req.getPassword()));
        usuario.setRol(rol);
        usuarioRepository.saveAndFlush(usuario);
        entityManager.refresh(usuario); // recupera fecha_registro asignada por la base de datos
        return toResponse(usuario);
    }

    public UsuarioResponse update(Integer id, UsuarioUpdateRequest req) {
        Usuario usuario = find(id);
        if (usuarioRepository.existsByEmailIgnoreCaseAndIdNot(req.getEmail(), id)) {
            throw new ConflictException("Ya existe un usuario con ese email");
        }
        mapper.updateBase(req, usuario);
        if (req.getPassword() != null) {
            usuario.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        if (usuario instanceof Administrador a) {
            a.setDepartamento(req.getDepartamento());
        } else if (usuario instanceof Empleado e) {
            e.setTurno(req.getTurno());
            e.setAreaAlmacen(req.getAreaAlmacen());
        }
        return toResponse(usuarioRepository.save(usuario));
    }

    public void delete(Integer id) {
        Usuario usuario = find(id);
        if (usuario.getId().equals(CurrentUser.get().id())) {
            throw new ConflictException("No puedes eliminar tu propio usuario");
        }
        try {
            usuarioRepository.delete(usuario);
            usuarioRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("No se puede eliminar: el usuario tiene movimientos registrados");
        }
    }

    private Usuario find(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Usuario " + id + " no encontrado"));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        UsuarioResponse res = mapper.toResponse(usuario);
        mapper.fillSubtype(usuario, res);
        return res;
    }
}
