

package com.logistics.warehouse;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/packages")
@CrossOrigin(origins = "http://localhost:5173")
public class PackageController {

    private final PackageRepository repository;

    public PackageController(PackageRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<PackageEntity> allPackages()
            throws ExecutionException, InterruptedException {
        return repository.findAll();
    }

    @GetMapping("/{trackingId}")
    public PackageEntity getByTrackingId(
            @PathVariable String trackingId)
            throws ExecutionException, InterruptedException {

        return repository.findByTrackingIdIgnoreCase(trackingId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Package not found"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PackageEntity register(
            @Valid @RequestBody PackageEntity request)
            throws ExecutionException, InterruptedException {

        request.setId(null);
        request.setTrackingId(null);
        request.setStatus(PackageStatus.REGISTERED);
        request.setDispatchedAt(null);
        request.prepareForSave();

        return repository.save(request);
    }

    @PatchMapping("/{id}/store")
    public PackageEntity markStored(@PathVariable String id)
            throws ExecutionException, InterruptedException {

        PackageEntity item = findById(id);

        if (item.getStatus() == PackageStatus.DISPATCHED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Dispatched package cannot be stored again");
        }

        item.setStatus(PackageStatus.STORED);
        return repository.save(item);
    }

    @PatchMapping("/{id}/dispatch")
    public PackageEntity dispatch(@PathVariable String id)
            throws ExecutionException, InterruptedException {

        PackageEntity item = findById(id);

        if (item.getStatus() == PackageStatus.DISPATCHED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Package is already dispatched");
        }

        item.setStatus(PackageStatus.DISPATCHED);
        item.setDispatchedAt(java.util.Map.of("value", LocalDateTime.now().toString()));
        return repository.save(item);
    }

    @GetMapping("/summary")
    public Map<String, Long> summary()
            throws ExecutionException, InterruptedException {

        List<PackageEntity> all = repository.findAll();

        return Map.of(
                "total", (long) all.size(),
                "registered", all.stream()
                        .filter(p -> p.getStatus() == PackageStatus.REGISTERED)
                        .count(),
                "stored", all.stream()
                        .filter(p -> p.getStatus() == PackageStatus.STORED)
                        .count(),
                "dispatched", all.stream()
                        .filter(p -> p.getStatus() == PackageStatus.DISPATCHED)
                        .count()
        );
    }

    private PackageEntity findById(String id)
            throws ExecutionException, InterruptedException {

        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Package not found"));
    }
}
