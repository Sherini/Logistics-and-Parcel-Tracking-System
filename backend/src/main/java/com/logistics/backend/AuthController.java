
package com.logistics.backend;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.cloud.FirestoreClient;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger =
            LoggerFactory.getLogger(AuthController.class);

    @PostMapping("/verify")
    public ResponseEntity<?> verifyToken(
            @RequestHeader(
                    value = "Authorization",
                    required = false
            ) String authorization) {

        if (authorization == null ||
                !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Missing Firebase ID token"));
        }

        String idToken = authorization.substring(7);

        try {
            FirebaseToken decodedToken =
                    FirebaseAuth.getInstance().verifyIdToken(idToken);

            String uid = decodedToken.getUid();

            DocumentSnapshot profile = FirestoreClient.getFirestore()
                    .collection("users")
                    .document(uid)
                    .get()
                    .get();

            if (!profile.exists()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "User profile not found"));
            }

            Object roleValue = profile.get("role");

            if (!(roleValue instanceof String role) ||
                    !isValidRole(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Invalid user role"));
            }

            return ResponseEntity.ok(Map.of(
                    "authenticated", true,
                    "uid", uid,
                    "email", decodedToken.getEmail() == null
                            ? "" : decodedToken.getEmail(),
                    "role", role
            ));

        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            logger.error("Token verification interrupted", error);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to verify account"));

        } catch (ExecutionException error) {
            logger.error("Could not load user profile", error);

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Unable to load user profile"));

        } catch (Exception error) {
            logger.error("Firebase token verification failed: {}",
                    error.getMessage(), error);

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error",
                            "Invalid or expired Firebase ID token"
                    ));
        }
    }

    private boolean isValidRole(String role) {
        return role.equals("Customer")
                || role.equals("Warehouse Staff")
                || role.equals("Delivery Agent")
                || role.equals("Admin");
    }
}
