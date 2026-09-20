package com.example.stockya.service;

import com.example.stockya.dto.CategoriaRequest;
import com.example.stockya.dto.CategoriaResponse;
import com.example.stockya.entity.Categoria;
import com.example.stockya.exception.ConflictException;
import com.example.stockya.exception.NotFoundException;
import com.example.stockya.mapper.CategoriaMapper;
import com.example.stockya.repository.CategoriaRepository;
import com.example.stockya.repository.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final CategoriaMapper mapper;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> findAll() {
        return categoriaRepository.findAll().stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse getById(Integer id) {
        return mapper.toResponse(find(id));
    }

    public CategoriaResponse create(CategoriaRequest req) {
        if (categoriaRepository.existsByNombreIgnoreCase(req.getNombre())) {
            throw new ConflictException("Ya existe una categoría con ese nombre");
        }
        return mapper.toResponse(categoriaRepository.save(mapper.toEntity(req)));
    }

    public CategoriaResponse update(Integer id, CategoriaRequest req) {
        Categoria categoria = find(id);
        if (categoriaRepository.existsByNombreIgnoreCaseAndIdNot(req.getNombre(), id)) {
            throw new ConflictException("Ya existe una categoría con ese nombre");
        }
        mapper.update(req, categoria);
        return mapper.toResponse(categoriaRepository.save(categoria));
    }

    public void delete(Integer id) {
        Categoria categoria = find(id);
        if (productoRepository.existsByCategoriaId(id)) {
            throw new ConflictException("No se puede eliminar: la categoría tiene productos asociados");
        }
        categoriaRepository.delete(categoria);
    }

    private Categoria find(Integer id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Categoría " + id + " no encontrada"));
    }
}
