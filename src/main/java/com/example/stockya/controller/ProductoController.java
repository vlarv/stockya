package com.example.stockya.controller;

import com.example.stockya.dto.ProductoRequest;
import com.example.stockya.dto.ProductoResponse;
import com.example.stockya.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService service;

    @GetMapping
    public List<ProductoResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/stock-bajo")
    public List<ProductoResponse> findStockBajo() {
        return service.findStockBajo();
    }

    @GetMapping("/{id}")
    public ProductoResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponse create(@Valid @RequestBody ProductoRequest req) {
        return service.create(req);
    }

    @PutMapping("/{id}")
    public ProductoResponse update(@PathVariable Integer id, @Valid @RequestBody ProductoRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
