package com.example.stockya.mapper;

import com.example.stockya.dto.ProductoRequest;
import com.example.stockya.dto.ProductoResponse;
import com.example.stockya.entity.Producto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ProductoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "stock", ignore = true)
    @Mapping(target = "categoria", ignore = true) // la resuelve el service
    Producto toEntity(ProductoRequest req);

    @Mapping(source = "categoria.id", target = "categoriaId")
    @Mapping(source = "categoria.nombre", target = "categoriaNombre")
    ProductoResponse toResponse(Producto producto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "stock", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    void update(ProductoRequest req, @MappingTarget Producto producto);
}
