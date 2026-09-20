package com.example.stockya.controller;

import com.example.stockya.dto.CategoriaRequest;
import com.example.stockya.dto.CategoriaResponse;
import com.example.stockya.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService service;

    @GetMapping
    public List<CategoriaResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public CategoriaResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoriaResponse create(@Valid @RequestBody CategoriaRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public CategoriaResponse update(@PathVariable Integer id, @Valid @RequestBody CategoriaRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
