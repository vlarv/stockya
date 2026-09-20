package com.example.stockya.service;

import com.example.stockya.dto.DetalleRequest;
import com.example.stockya.dto.MovimientoRequest;
import com.example.stockya.dto.MovimientoResponse;
import com.example.stockya.dto.MovimientoUpdateRequest;
import com.example.stockya.dto.TipoMovimientoResponse;
import com.example.stockya.entity.Movimiento;
import com.example.stockya.entity.MovimientoDetalle;
import com.example.stockya.entity.Producto;
import com.example.stockya.entity.TipoMovimiento;
import com.example.stockya.entity.Usuario;
import com.example.stockya.exception.ConflictException;
import com.example.stockya.exception.ForbiddenException;
import com.example.stockya.exception.NotFoundException;
import com.example.stockya.security.AuthUser;
import com.example.stockya.security.CurrentUser;
import com.example.stockya.mapper.MovimientoMapper;
import com.example.stockya.repository.MovimientoDetalleRepository;
import com.example.stockya.repository.MovimientoRepository;
import com.example.stockya.repository.ProductoRepository;
import com.example.stockya.repository.TipoMovimientoRepository;
import com.example.stockya.repository.UsuarioRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@Transactional
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final MovimientoDetalleRepository detalleRepository;
    private final ProductoRepository productoRepository;
    private final TipoMovimientoRepository tipoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MovimientoMapper mapper;
    private final EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<TipoMovimientoResponse> findTipos() {
        return tipoRepository.findAll().stream().map(mapper::toTipoResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> findAll() {
        AuthUser user = CurrentUser.get();
        List<Movimiento> movimientos = user.isAdministrador()
                ? movimientoRepository.findAll()
                : movimientoRepository.findByResponsableId(user.id());
        return movimientos.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MovimientoResponse getById(Integer id) {
        return toResponse(findOwned(id));
    }

    public MovimientoResponse create(MovimientoRequest req) {
        TipoMovimiento tipo = tipoRepository.findById(req.getTipoMovimientoId())
                .orElseThrow(() -> new NotFoundException("Tipo de movimiento " + req.getTipoMovimientoId() + " no encontrado"));
        // El responsable es siempre el usuario autenticado
        Integer usuarioId = CurrentUser.get().id();
        Usuario responsable = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new NotFoundException("Usuario " + usuarioId + " no encontrado"));

        // Suma las cantidades por producto (un producto puede repetirse en varias líneas).
        // TreeMap: se bloquea siempre en el mismo orden para evitar deadlocks.
        Map<Integer, Integer> totales = new TreeMap<>();
        for (DetalleRequest d : req.getDetalles()) {
            totales.merge(d.getProductoId(), d.getCantidad(), Integer::sum);
        }

        Map<Integer, Producto> productos = new TreeMap<>();
        for (Integer productoId : totales.keySet()) {
            Producto producto = productoRepository.findByIdForUpdate(productoId)
                    .orElseThrow(() -> new NotFoundException("Producto " + productoId + " no encontrado"));
            productos.put(productoId, producto);
        }

        // Regla de negocio: una salida no puede dejar el stock en negativo
        if (tipo.getMultiplicador() < 0) {
            totales.forEach((productoId, cantidad) -> {
                Producto p = productos.get(productoId);
                int disponible = p.getStock() == null ? 0 : p.getStock();
                if (cantidad > disponible) {
                    throw new ConflictException("Stock insuficiente para '" + p.getNombre()
                            + "': disponible " + disponible + ", solicitado " + cantidad);
                }
            });
        }

        Movimiento movimiento = mapper.toEntity(req);
        movimiento.setTipoMovimiento(tipo);
        movimiento.setResponsable(responsable);
        movimientoRepository.saveAndFlush(movimiento);

        for (DetalleRequest d : req.getDetalles()) {
            MovimientoDetalle detalle = mapper.toDetalleEntity(d);
            detalle.setMovimiento(movimiento);
            detalle.setProducto(productos.get(d.getProductoId()));
            detalleRepository.save(detalle);
        }
        detalleRepository.flush(); // dispara el trigger que actualiza el stock
        entityManager.refresh(movimiento); // recupera la fecha asignada por la base de datos
        return toResponse(movimiento);
    }

    public MovimientoResponse update(Integer id, MovimientoUpdateRequest req) {
        Movimiento movimiento = findOwned(id);
        mapper.update(req, movimiento);
        return toResponse(movimientoRepository.save(movimiento));
    }

    public void delete(Integer id) {
        Movimiento movimiento = findOwned(id);
        try {
            // El trigger revierte el stock al borrar cada detalle
            detalleRepository.deleteAll(detalleRepository.findByMovimientoId(id));
            detalleRepository.flush();
            movimientoRepository.delete(movimiento);
            movimientoRepository.flush();
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("No se puede eliminar: revertir este movimiento dejaría un producto con stock negativo");
        }
    }

    private Movimiento find(Integer id) {
        return movimientoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Movimiento " + id + " no encontrado"));
    }

    /** Pertenencia: el administrador accede a todo; los demás solo a sus propios movimientos. */
    private Movimiento findOwned(Integer id) {
        Movimiento movimiento = find(id);
        AuthUser user = CurrentUser.get();
        if (!user.isAdministrador() && !movimiento.getResponsable().getId().equals(user.id())) {
            throw new ForbiddenException("No tienes acceso a este movimiento");
        }
        return movimiento;
    }

    private MovimientoResponse toResponse(Movimiento movimiento) {
        MovimientoResponse res = mapper.toResponse(movimiento);
        res.setDetalles(detalleRepository.findByMovimientoId(movimiento.getId()).stream()
                .map(mapper::toDetalleResponse).toList());
        return res;
    }
}
