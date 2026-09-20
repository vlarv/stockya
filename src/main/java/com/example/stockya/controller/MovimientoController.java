package com.example.stockya.controller;

import com.example.stockya.dto.MovimientoRequest;
import com.example.stockya.dto.MovimientoResponse;
import com.example.stockya.dto.MovimientoUpdateRequest;
import com.example.stockya.dto.TipoMovimientoResponse;
import com.example.stockya.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService service;

    @GetMapping("/tipos-movimiento")
    public List<TipoMovimientoResponse> findTipos() {
        return service.findTipos();
    }

    @GetMapping("/movimientos")
    public List<MovimientoResponse> findAll() {
        return service.findAll();
    }

    @GetMapping("/movimientos/{id}")
    public MovimientoResponse getById(@PathVariable Integer id) {
        return service.getById(id);
    }

    @PostMapping("/movimientos")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoResponse create(@Valid @RequestBody MovimientoRequest req) {
        return service.create(req);
    }

    @PutMapping("/movimientos/{id}")
    public MovimientoResponse update(@PathVariable Integer id, @Valid @RequestBody MovimientoUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/movimientos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Integer id) {
        service.delete(id);
    }
}
