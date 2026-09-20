package com.example.stockya.mapper;

import com.example.stockya.dto.CategoriaRequest;
import com.example.stockya.dto.CategoriaResponse;
import com.example.stockya.entity.Categoria;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    @Mapping(target = "id", ignore = true)
    Categoria toEntity(CategoriaRequest req);

    CategoriaResponse toResponse(Categoria categoria);

    @Mapping(target = "id", ignore = true)
    void update(CategoriaRequest req, @MappingTarget Categoria categoria);
}
