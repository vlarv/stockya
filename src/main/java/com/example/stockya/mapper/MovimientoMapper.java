package com.example.stockya.mapper;

import com.example.stockya.dto.DetalleRequest;
import com.example.stockya.dto.DetalleResponse;
import com.example.stockya.dto.MovimientoRequest;
import com.example.stockya.dto.MovimientoResponse;
import com.example.stockya.dto.MovimientoUpdateRequest;
import com.example.stockya.dto.TipoMovimientoResponse;
import com.example.stockya.entity.Movimiento;
import com.example.stockya.entity.MovimientoDetalle;
import com.example.stockya.entity.TipoMovimiento;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MovimientoMapper {

    // tipo, responsable y detalles los resuelve el service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tipoMovimiento", ignore = true)
    @Mapping(target = "responsable", ignore = true)
    @Mapping(target = "fecha", ignore = true)
    Movimiento toEntity(MovimientoRequest req);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "movimiento", ignore = true)
    @Mapping(target = "producto", ignore = true)
    MovimientoDetalle toDetalleEntity(DetalleRequest req);

    @Mapping(source = "tipoMovimiento.id", target = "tipoMovimientoId")
    @Mapping(source = "tipoMovimiento.nombre", target = "tipoMovimientoNombre")
    @Mapping(source = "responsable.id", target = "responsableId")
    @Mapping(source = "responsable.nombre", target = "responsableNombre")
    @Mapping(target = "detalles", ignore = true)
    MovimientoResponse toResponse(Movimiento movimiento);

    @Mapping(source = "producto.id", target = "productoId")
    @Mapping(source = "producto.nombre", target = "productoNombre")
    DetalleResponse toDetalleResponse(MovimientoDetalle detalle);

    TipoMovimientoResponse toTipoResponse(TipoMovimiento tipo);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "tipoMovimiento", ignore = true)
    @Mapping(target = "responsable", ignore = true)
    @Mapping(target = "fecha", ignore = true)
    void update(MovimientoUpdateRequest req, @MappingTarget Movimiento movimiento);
}
