package com.example.stockya.repository;

import com.example.stockya.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimientoRepository extends JpaRepository<Movimiento, Integer> {
    List<Movimiento> findByResponsableId(Integer responsableId);
}
