package com.example.stockya.repository;

import com.example.stockya.entity.MovimientoDetalle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoDetalleRepository extends JpaRepository<MovimientoDetalle, Integer> {
    List<MovimientoDetalle> findByMovimientoId(Integer movimientoId);
    boolean existsByProductoId(Integer productoId);
}
