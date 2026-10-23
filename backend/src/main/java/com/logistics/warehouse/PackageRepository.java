
package com.logistics.warehouse;

import com.google.api.core.ApiFuture;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.cloud.firestore.QuerySnapshot;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ExecutionException;

@Repository
public class PackageRepository {

    private final CollectionReference packages;

    public PackageRepository(Firestore firestore) {
        this.packages = firestore.collection("packages");
    }

    public PackageEntity save(PackageEntity entity)
            throws ExecutionException, InterruptedException {

        entity.prepareForSave();

        String documentId = entity.getId();

        if (documentId == null || documentId.isBlank()) {
            documentId = entity.getTrackingId();
            entity.setId(documentId);
        }

        packages.document(documentId).set(entity).get();

        return entity;
    }

    public List<PackageEntity> findAll()
            throws ExecutionException, InterruptedException {

        ApiFuture<QuerySnapshot> future = packages.get();
        List<QueryDocumentSnapshot> documents =
                future.get().getDocuments();

        List<PackageEntity> result = new ArrayList<>();

        for (QueryDocumentSnapshot document : documents) {
            PackageEntity entity =
                    document.toObject(PackageEntity.class);
            entity.setId(document.getId());
            result.add(entity);
        }

        return result;
    }

    public Optional<PackageEntity> findByTrackingIdIgnoreCase(
            String trackingId)
            throws ExecutionException, InterruptedException {

        ApiFuture<QuerySnapshot> future = packages
                .whereEqualTo("trackingId", trackingId)
                .get();

        List<QueryDocumentSnapshot> documents =
                future.get().getDocuments();

        if (documents.isEmpty()) {
            return Optional.empty();
        }

        QueryDocumentSnapshot document = documents.get(0);

        PackageEntity entity =
                document.toObject(PackageEntity.class);

        entity.setId(document.getId());

        return Optional.of(entity);
    }

    public Optional<PackageEntity> findById(String id)
            throws ExecutionException, InterruptedException {

        DocumentSnapshot document =
                packages.document(id).get().get();

        if (!document.exists()) {
            return Optional.empty();
        }

        PackageEntity entity =
                document.toObject(PackageEntity.class);

        entity.setId(document.getId());

        return Optional.of(entity);
    }

    public void deleteById(String id)
            throws ExecutionException, InterruptedException {

        packages.document(id).delete().get();
    }
}
