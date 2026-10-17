package com.logistics.warehouse;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "http://localhost:5173")
public class PackageController {
    private final PackageRepository repository;

    public PackageController(PackageRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PackageEntity> allPackages() {
        return repository.findAll();
    }

    @GetMapping("/{trackingId}")
    public PackageEntity getByTrackingId(@PathVariable String trackingId) {
        return repository.findByTrackingIdIgnoreCase(trackingId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PackageEntity register(@Valid @RequestBody PackageEntity request) {
        request.setTrackingId(null);
        request.setStatus(PackageStatus.REGISTERED);
        request.setDispatchedAt(null);
        return repository.save(request);
    }

    @PatchMapping("/{id}/store")
    public PackageEntity markStored(@PathVariable Long id) {
        PackageEntity item = findById(id);
        if (item.getStatus() == PackageStatus.DISPATCHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Dispatched package cannot be stored again");
        }
        item.setStatus(PackageStatus.STORED);
        return repository.save(item);
    }

    @PatchMapping("/{id}/dispatch")
    public PackageEntity dispatch(@PathVariable Long id) {
        PackageEntity item = findById(id);
        if (item.getStatus() == PackageStatus.DISPATCHED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Package is already dispatched");
        }
        item.setStatus(PackageStatus.DISPATCHED);
        item.setDispatchedAt(LocalDateTime.now());
        return repository.save(item);
    }

    @GetMapping("/summary")
    public Map<String, Long> summary() {
        List<PackageEntity> all = repository.findAll();
        return Map.of(
            "total", (long) all.size(),
            "registered", all.stream().filter(p -> p.getStatus() == PackageStatus.REGISTERED).count(),
            "stored", all.stream().filter(p -> p.getStatus() == PackageStatus.STORED).count(),
            "dispatched", all.stream().filter(p -> p.getStatus() == PackageStatus.DISPATCHED).count()
        );
    }

    private PackageEntity findById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Package not found"));
    }
}