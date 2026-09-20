package com.example.stockya.repository;

import com.example.stockya.entity.Producto;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    // Bloquea la fila mientras se valida el stock, para evitar salidas simultáneas
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Producto p where p.id = :id")
    Optional<Producto> findByIdForUpdate(@Param("id") Integer id);

    @Query("select p from Producto p where p.stock <= p.stockMinimo order by p.stock asc, p.nombre asc")
    List<Producto> findStockBajo();

    boolean existsByCategoriaId(Integer categoriaId);
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, Integer id);
}
