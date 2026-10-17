package com.logistics.warehouse;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PackageRepository extends JpaRepository<PackageEntity, Long> {
    Optional<PackageEntity> findByTrackingIdIgnoreCase(String trackingId);
}