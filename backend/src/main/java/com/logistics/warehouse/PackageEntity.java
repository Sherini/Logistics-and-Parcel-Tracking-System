


package com.logistics.warehouse;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.UUID;

public class PackageEntity {

    private String id;
    private String trackingId;

    @NotBlank
    private String senderName;

    @NotBlank
    private String receiverName;

    @NotBlank
    private String destination;

    @Positive
    private double weightKg;

    @NotBlank
    private String dimensions;

    private PackageStatus status = PackageStatus.REGISTERED;
    private Object createdAt = LocalDateTime.now().toString();
    private Object dispatchedAt;

    public PackageEntity() {
    }

    public void prepareForSave() {
        if (trackingId == null || trackingId.isBlank()) {
            trackingId = "PKG-" +
                    UUID.randomUUID().toString()
                            .substring(0, 8).toUpperCase();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now().toString();
        }
        if (status == null) {
            status = PackageStatus.REGISTERED;
        }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTrackingId() { return trackingId; }
    public void setTrackingId(String trackingId) {
        this.trackingId = trackingId;
    }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getDestination() { return destination; }
    public void setDestination(String destination) {
        this.destination = destination;
    }

    public double getWeightKg() { return weightKg; }
    public void setWeightKg(double weightKg) {
        this.weightKg = weightKg;
    }

    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) {
        this.dimensions = dimensions;
    }

    public PackageStatus getStatus() { return status; }
    public void setStatus(PackageStatus status) {
        this.status = status;
    }

    public Object getCreatedAt() { return createdAt; }
    public void setCreatedAt(Object createdAt) {
        this.createdAt = createdAt;
    }

    public Object getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(Object dispatchedAt) {
        this.dispatchedAt = dispatchedAt;
    }
}
