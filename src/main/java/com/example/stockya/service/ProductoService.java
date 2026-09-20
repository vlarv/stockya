package com.example.stockya.service;

import com.example.stockya.dto.ProductoRequest;
import com.example.stockya.dto.ProductoResponse;
import com.example.stockya.entity.Categoria;
import com.example.stockya.entity.Producto;
import com.example.stockya.exception.ConflictException;
import com.example.stockya.exception.NotFoundException;
import com.example.stockya.mapper.ProductoMapper;
import com.example.stockya.repository.CategoriaRepository;
import com.example.stockya.repository.ProductoRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoMapper mapper;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<ProductoResponse> findAll() {
        return productoRepository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> findStockBajo() {
        return productoRepository.findStockBajo().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse getById(Integer id) {
        return mapper.toResponse(find(id));
    }

    public ProductoResponse create(ProductoRequest req) {
        if (productoRepository.existsByNombreIgnoreCase(req.getNombre())) {
            throw new ConflictException("Ya existe un producto con ese nombre");
        }
        Producto producto = mapper.toEntity(req);
        producto.setCategoria(findCategoria(req.getCategoriaId()));
        Producto saved = productoRepository.saveAndFlush(producto);
        // stock lo asigna la base de datos (DEFAULT 0): se refresca para devolverlo
        entityManager.refresh(saved);
        return mapper.toResponse(saved);
    }

    public ProductoResponse update(Integer id, ProductoRequest req) {
        Producto producto = find(id);
        if (productoRepository.existsByNombreIgnoreCaseAndIdNot(req.getNombre(), id)) {
            throw new ConflictException("Ya existe un producto con ese nombre");
        }
        mapper.update(req, producto);
        producto.setCategoria(findCategoria(req.getCategoriaId()));
        return mapper.toResponse(productoRepository.save(producto));
    }

    public void delete(Integer id) {
        Producto producto = find(id);
        try {
            productoRepository.delete(producto);
            productoRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("No se puede eliminar: el producto tiene movimientos asociados");
        }
    }

    private Producto find(Integer id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto " + id + " no encontrado"));
    }

    private Categoria findCategoria(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoría " + id + " no encontrada"));
    }
}
