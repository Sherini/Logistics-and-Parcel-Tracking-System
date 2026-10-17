package com.logistics.warehouse;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "packages")
public class PackageEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String trackingId;

    @NotBlank @Column(nullable = false)
    private String senderName;

    @NotBlank @Column(nullable = false)
    private String receiverName;

    @NotBlank @Column(nullable = false)
    private String destination;

    @Positive @Column(nullable = false)
    private double weightKg;

    @NotBlank @Column(nullable = false)
    private String dimensions;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private PackageStatus status = PackageStatus.REGISTERED;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime dispatchedAt;

    public PackageEntity() {}

    @PrePersist
    void beforeSave() {
        if (trackingId == null || trackingId.isBlank()) {
            trackingId = "PKG-" + java.util.UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = PackageStatus.REGISTERED;
    }

    public Long getId() { return id; }
    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) { this.trackingId = trackingId; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) { this.weightKg = weightKg; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public PackageStatus getStatus() { return status; }
    public void setStatus(PackageStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(LocalDateTime dispatchedAt) { this.dispatchedAt = dispatchedAt; }
}