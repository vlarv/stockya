package com.example.stockya.mapper;

import com.example.stockya.dto.UsuarioResponse;
import com.example.stockya.dto.UsuarioUpdateRequest;
import com.example.stockya.entity.Administrador;
import com.example.stockya.entity.Empleado;
import com.example.stockya.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    // Los datos propios de cada subtipo los completa el service
    @Mapping(source = "rol.id", target = "rolId")
    @Mapping(source = "rol.nombre", target = "rolNombre")
    @Mapping(target = "departamento", ignore = true)
    @Mapping(target = "turno", ignore = true)
    @Mapping(target = "areaAlmacen", ignore = true)
    UsuarioResponse toResponse(Usuario usuario);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "rol", ignore = true)
    @Mapping(target = "password", ignore = true) // se cifra en el service
    @Mapping(target = "fechaRegistro", ignore = true)
    void updateBase(UsuarioUpdateRequest req, @MappingTarget Usuario usuario);

    default void fillSubtype(Usuario usuario, UsuarioResponse res) {
        if (usuario instanceof Administrador a) {
            res.setDepartamento(a.getDepartamento());
        } else if (usuario instanceof Empleado e) {
            res.setTurno(e.getTurno());
            res.setAreaAlmacen(e.getAreaAlmacen());
        }
    }
}
